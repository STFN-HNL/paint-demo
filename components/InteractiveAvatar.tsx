import {
  AvatarQuality,
  StreamingEvents,
  VoiceChatTransport,
  VoiceEmotion,
  StartAvatarRequest,
  STTProvider,
  ElevenLabsModel,
  TaskType,
  TaskMode,
} from "@heygen/streaming-avatar";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";

import { Button } from "./Button";
import { AvatarConfig } from "./AvatarConfig";
import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { AvatarControls } from "./AvatarSession/AvatarControls";
import { useVoiceChat } from "./logic/useVoiceChat";
import { StreamingAvatarProvider, StreamingAvatarSessionState } from "./logic";
import { LoadingIcon } from "./Icons";
import { MessageHistory } from "./AvatarSession/MessageHistory";
import { useStreamingAvatarContext } from "./logic/context";

import { AVATARS } from "@/app/lib/constants";

const DEFAULT_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.High,
  avatarName: "Pedro_Black_Suit_public",
  knowledgeId: "0782f55fe4d14b9ca68de65db448924e",
  voice: {
    rate: 1.5,
    emotion: VoiceEmotion.EXCITED,
    model: ElevenLabsModel.eleven_flash_v2_5,
  },
  language: "en",
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
};

// Dynamische intro teksten per taal
const AVATAR_INTRO_TEXTS: Record<string, string> = {
  en: "Welcome! I'm Alex Carter, Procurement Lead at a major shipyard. Over the next 10 minutes, we'll simulate a real procurement negotiation where I'll challenge you on pricing and value. Your goal? Convince me why your paint is worth 10 times more than competitors. I'll ask tough questions about cost, performance, and alternatives. You'll guide me through the discussion using PSM sales techniques. When you're done, say: 'STOP training.' I'll then give you feedback on your sales approach—what worked well and where you can improve. Let's see if you can close the deal! Say 'START training' when you're ready.",
  nl: "Welkom! Ik ben Alex Carter, Inkoopmanager bij een grote scheepswerf. De komende 10 minuten simuleren we een echte inkooponderhandeling waarin ik je uitdaag op prijs en waarde. Jouw doel? Overtuig mij waarom jouw verf 10 keer meer waard is dan die van de concurrent. Ik stel lastige vragen over kosten, prestaties en alternatieven. Jij leidt het gesprek met PSM-verkooptechnieken. Ben je klaar, zeg dan: 'STOP training.' Daarna geef ik feedback op je verkoopaanpak—wat goed ging en wat beter kan. Kun jij de deal sluiten? Zeg 'START training' als je wilt beginnen.",
  de: "Willkommen! Ich bin Alex Carter, Einkaufsleiter einer großen Werft. In den nächsten 10 Minuten simulieren wir eine echte Einkaufsverhandlung, in der ich dich zu Preis und Wert herausfordere. Dein Ziel? Überzeuge mich, warum deine Farbe zehnmal mehr wert ist als die der Konkurrenz. Ich werde schwierige Fragen zu Kosten, Leistung und Alternativen stellen. Du führst das Gespräch mit PSM-Verkaufstechniken. Wenn du fertig bist, sage: 'STOP training.' Dann gebe ich dir Feedback zu deinem Verkaufsansatz – was gut lief und was du verbessern kannst. Schaffst du es, den Deal abzuschließen? Sage 'START training', wenn du bereit bist.",
  fr: "Bienvenue ! Je suis Alex Carter, responsable des achats dans un grand chantier naval. Pendant les 10 prochaines minutes, nous allons simuler une véritable négociation d'achat où je te mettrai au défi sur le prix et la valeur. Ton objectif ? Me convaincre que ta peinture vaut 10 fois plus que celle des concurrents. Je poserai des questions difficiles sur le coût, la performance et les alternatives. Tu mèneras la discussion avec des techniques de vente PSM. Lorsque tu auras terminé, dis : 'STOP training.' Je te donnerai alors un retour sur ta démarche commerciale – ce qui a bien fonctionné et ce que tu peux améliorer. Prêt à conclure l'affaire ? Dis 'START training' quand tu es prêt.",
};

// Vertalingen voor alle zichtbare teksten
const TRANSLATIONS: Record<string, any> = {
  en: {
    title: "Meet Alex Carter",
    subtitle: "The AI Buyer Who Never Says Yes Easily",
    chooseLanguage: "Choose language:",
    chatNow: "Chat now",
    yourRole: "Your Role",
    yourRoleList: [
      "You are the sales manager – your job is to lead the conversation like you would with a real customer.",
      "The avatar plays the role of your customer – they will respond naturally based on your input.",
      'If the avatar behaves unnaturally or breaks character, simply say: "Stay in the role of your prompt."',
    ],
    howToUse: "How to Use",
    howToUseList: [
      "Click 'Chat now' to begin",
      "Say <b>Start coaching</b> to begin the session.",
      "Navigate customer conversations using open, thoughtful questions that uncover needs, build trust, and move the deal forward.",
      'Say: <b>End coaching and give feedback.</b>',
      'Receive <b>personalized feedback</b> on your sales skills',
    ],
    beforeYouStart: {
      title: "Before You Start",
      list: [
        "Use headphones for the best experience",
        "Ensure a stable internet connection – the avatar requires good connectivity",
        "Be patient – responses can take 10–15 seconds",
        "This is AI, not a human – it's not perfect, but it's a powerful way to learn",
      ],
    },
    wantToGetBetter: {
      title: "Want to Get Better?",
      list: [
        "Can you give me more detailed feedback on [specific area]?",
        "What should I practice next?",
      ],
    },
  },
  nl: {
    title: "Ontmoet Alex Carter",
    subtitle: "De AI-inkoper die niet snel ja zegt",
    chooseLanguage: "Kies taal:",
    chatNow: "Start chat",
    yourRole: "Jouw rol",
    yourRoleList: [
      "Jij bent de salesmanager – jouw taak is het gesprek te leiden zoals je dat met een echte klant zou doen.",
      "De avatar speelt de rol van jouw klant – deze reageert natuurlijk op jouw input.",
      'Als de avatar onnatuurlijk reageert of uit zijn rol valt, zeg dan: "Blijf in de rol van je prompt."',
    ],
    howToUse: "Hoe werkt het",
    howToUseList: [
      "Klik op 'Start chat' om te beginnen",
      "Zeg <b>Start coaching</b> om de sessie te starten.",
      "Navigeer klantgesprekken met open, doordachte vragen die behoeften blootleggen, vertrouwen opbouwen en de deal vooruit helpen.",
      'Zeg: <b>Beëindig coaching en geef feedback.</b>',
      'Ontvang <b>persoonlijke feedback</b> op je verkoopvaardigheden',
    ],
    beforeYouStart: {
      title: "Voordat je begint",
      list: [
        "Gebruik een koptelefoon voor de beste ervaring",
        "Zorg voor een stabiele internetverbinding – de avatar heeft goede connectiviteit nodig",
        "Wees geduldig – antwoorden kunnen 10–15 seconden duren",
        "Dit is AI, geen mens – het is niet perfect, maar wel een krachtige manier om te leren",
      ],
    },
    wantToGetBetter: {
      title: "Wil je beter worden?",
      list: [
        "Vraag: Kun je me meer gedetailleerde feedback geven over [specifiek onderdeel]?",
        "Vraag: Wat moet ik als volgende oefenen?",
      ],
    },
  },
  de: {
    title: "Lerne Alex Carter kennen",
    subtitle: "Der KI-Einkäufer, der nie leicht Ja sagt",
    chooseLanguage: "Sprache wählen:",
    chatNow: "Jetzt chatten",
    yourRole: "Deine Rolle",
    yourRoleList: [
      "Du bist der Verkaufsleiter – deine Aufgabe ist es, das Gespräch wie mit einem echten Kunden zu führen.",
      "Der Avatar spielt die Rolle deines Kunden – er reagiert natürlich auf deine Eingaben.",
      'Wenn der Avatar unnatürlich reagiert oder aus der Rolle fällt, sage einfach: "Bleib in der Rolle deiner Vorgabe."',
    ],
    howToUse: "So funktioniert es",
    howToUseList: [
      "Klicke auf 'Jetzt chatten', um zu beginnen",
      "Sage <b>Start coaching</b>, um die Sitzung zu beginnen.",
      "Führe Kundengespräche mit offenen, durchdachten Fragen, die Bedürfnisse aufdecken, Vertrauen aufbauen und den Abschluss vorantreiben.",
      'Sage: <b>Coaching beenden und Feedback geben.</b>',
      'Erhalte <b>persönliches Feedback</b> zu deinen Verkaufsfähigkeiten',
    ],
    beforeYouStart: {
      title: "Bevor du startest",
      list: [
        "Verwende Kopfhörer für das beste Erlebnis",
        "Stelle eine stabile Internetverbindung sicher – der Avatar benötigt eine gute Verbindung",
        "Sei geduldig – Antworten können 10–15 Sekunden dauern",
        "Das ist KI, kein Mensch – es ist nicht perfekt, aber eine großartige Lernmöglichkeit",
      ],
    },
    wantToGetBetter: {
      title: "Möchtest du dich verbessern?",
      list: [
        "Kannst du mir detaillierteres Feedback zu [bestimmtem Bereich] geben?",
        "Woran sollte ich als Nächstes arbeiten?",
      ],
    },
  },
  fr: {
    title: "Rencontrez Alex Carter",
    subtitle: "L'acheteur IA qui ne dit jamais oui facilement",
    chooseLanguage: "Choisissez la langue :",
    chatNow: "Démarrer le chat",
    yourRole: "Votre rôle",
    yourRoleList: [
      "Vous êtes le responsable des ventes – votre travail consiste à mener la conversation comme avec un vrai client.",
      "L'avatar joue le rôle de votre client – il répond naturellement en fonction de vos actions.",
      'Si l\'avatar agit de manière étrange ou sort de son rôle, dites simplement : "Reste dans le rôle de ton prompt."',
    ],
    howToUse: "Comment utiliser",
    howToUseList: [
      "Cliquez sur 'Démarrer le chat' pour commencer",
      "Dites <b>Start coaching</b> pour démarrer la session.",
      "Menez des conversations clients avec des questions ouvertes et réfléchies qui révèlent les besoins, instaurent la confiance et font avancer l'affaire.",
      'Dites : <b>Terminer le coaching et donner un retour.</b>',
      'Recevez <b>un feedback personnalisé</b> sur vos compétences commerciales',
    ],
    beforeYouStart: {
      title: "Avant de commencer",
      list: [
        "Utilisez un casque pour une meilleure expérience",
        "Assurez-vous d'une connexion Internet stable – l'avatar nécessite une bonne connectivité",
        "Soyez patient – les réponses peuvent prendre 10 à 15 secondes",
        "Ceci est une IA, pas un humain – ce n'est pas parfait, mais c'est un excellent moyen d'apprendre",
      ],
    },
    wantToGetBetter: {
      title: "Vous voulez progresser ?",
      list: [
        "Pouvez-vous me donner un retour plus détaillé sur [domaine spécifique] ?",
        "Que devrais-je pratiquer ensuite ?",
      ],
    },
  },
};

function InteractiveAvatar() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();
  const { setIsMuted } = useStreamingAvatarContext();

  const [config, setConfig] = useState<StartAvatarRequest>(DEFAULT_CONFIG);

  const mediaStream = useRef<HTMLVideoElement>(null);

  // Language options
  const languageOptions = [
    { label: "English", value: "en" },
    { label: "Nederlands", value: "nl" },
    { label: "Deutsch", value: "de" },
    { label: "Français", value: "fr" },
  ];

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();

      console.log("Access Token:", token); // Log the token to verify

      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  const startSessionV2 = useMemoizedFn(async (isVoiceChat: boolean) => {
    try {
      const newToken = await fetchAccessToken();
      const avatar = initAvatar(newToken);

      // Forceer altijd de juiste knowledgeId, avatarName en verwijder de achtergrond
      const forcedConfig = { ...config, knowledgeId: "0782f55fe4d14b9ca68de65db448924e", avatarName: "Pedro_Chair_Sitting_public", needRemoveBackground: true };

      avatar.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
        console.log("Avatar started talking", e);
      });
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
        console.log("Avatar stopped talking", e);
      });
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("Stream disconnected");
      });
      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log(">>>>> Stream ready:", event.detail);
      });
      avatar.on(StreamingEvents.USER_START, (event) => {
        console.log(">>>>> User started talking:", event);
      });
      avatar.on(StreamingEvents.USER_STOP, (event) => {
        console.log(">>>>> User stopped talking:", event);
      });
      avatar.on(StreamingEvents.USER_END_MESSAGE, (event) => {
        console.log(">>>>> User end message:", event);
      });
      avatar.on(StreamingEvents.USER_TALKING_MESSAGE, (event) => {
        console.log(">>>>> User talking message:", event);
      });
      avatar.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (event) => {
        console.log(">>>>> Avatar talking message:", event);
      });
      avatar.on(StreamingEvents.AVATAR_END_MESSAGE, (event) => {
        console.log(">>>>> Avatar end message:", event);
      });

      await startAvatar(forcedConfig);

      // Always start voice chat
      await avatar.startVoiceChat();

      // Force unmute after starting voice chat
      await avatar.unmuteInputAudio();
      setIsMuted(false);

      // Speak the intro message synchronously
      const getIntroText = () => AVATAR_INTRO_TEXTS[String(config.language)] || AVATAR_INTRO_TEXTS.en;
      await avatar.speak({
        text: getIntroText(),
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.SYNC,
      });
    } catch (error) {
      console.error("Error starting avatar session:", error);
    }
  });

  useUnmount(() => {
    stopAvatar();
  });

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
      };
    }
  }, [mediaStream, stream]);

  const t = TRANSLATIONS[String(config.language)] || TRANSLATIONS.en;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-4 sm:py-8">
      {/* Language Switcher helemaal bovenaan */}
      <div className="w-full max-w-xs mt-4 mb-6">
        <label htmlFor="language-select" className="block mb-2 text-sm font-medium text-gray-700">{t.chooseLanguage}</label>
        <select
          id="language-select"
          className="block w-full p-2 border border-gray-300 rounded-lg"
          value={config.language}
          onChange={e => setConfig({ ...config, language: e.target.value })}
        >
          {languageOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-10 items-center px-1 sm:px-6">
        <div className="bg-white rounded-xl p-6 sm:p-10 w-full mb-2 mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-2">{t.title}</h1>
          <p className="text-lg sm:text-xl text-gray-700 mb-2 font-semibold">{t.subtitle}</p>
          <div className="mb-4">
            <div className="font-semibold mb-1 text-lg sm:text-xl">✅ {t.beforeYouStart.title}</div>
            <ul className="list-disc list-inside text-base sm:text-lg text-gray-700 ml-2">
              {t.beforeYouStart.list.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-1 text-lg sm:text-xl">🎯 {t.yourRole}</div>
            <ul className="list-disc list-inside text-base sm:text-lg text-gray-700 ml-2">
              {t.yourRoleList.map((item: string, idx: number) => (
                <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-1 text-lg sm:text-xl">🛠️ {t.howToUse}</div>
            <ol className="list-decimal list-inside text-base sm:text-lg text-gray-700 ml-2">
              {t.howToUseList.map((item: string, idx: number) => (
                <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ol>
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-1 text-lg sm:text-xl">🔍 {t.wantToGetBetter.title}</div>
            <ul className="list-disc list-inside text-base sm:text-lg text-gray-700 ml-2">
              {t.wantToGetBetter.list.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center">
          <div className="w-full max-w-5xl aspect-video bg-white rounded-xl shadow-2xl overflow-hidden flex items-center justify-center mx-auto" style={{ minHeight: '460px', backgroundColor: '#fff' }}>
            {sessionState !== StreamingAvatarSessionState.INACTIVE ? (
              <AvatarVideo ref={mediaStream} />
            ) : (
              <>
                <img src="https://files2.heygen.ai/avatar/v3/92de79e533a8421bb86da63a0e5eb12f_57010/preview_target.webp" alt="Avatar preview" className="w-full h-full object-cover" />
                <button
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg text-lg transition z-10"
                  onClick={() => startSessionV2(true)}
                >
                  {t.chatNow}
                </button>
              </>
            )}
          </div>
        </div>
        {sessionState === StreamingAvatarSessionState.CONNECTED && (
          <div className="w-full mt-4">
            <MessageHistory />
          </div>
        )}
      </div>
    </div>
  );
}

export default function InteractiveAvatarWrapper() {
  return (
    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
      <InteractiveAvatar />
    </StreamingAvatarProvider>
  );
}
