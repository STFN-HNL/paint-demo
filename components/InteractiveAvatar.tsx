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

const AVATAR_INTRO = "Welcome! I'm Alex Carter, Procurement Lead at a major shipyard. Over the next 10 minutes, we'll simulate a real procurement negotiation where I'll challenge you on pricing and value. Your goal? Convince me why your paint is worth 10 times more than competitors. I'll ask tough questions about cost, performance, and alternatives. You'll guide me through the discussion using PSM sales techniques. When you're done, say: 'STOP training.' I'll then give you feedback on your sales approach—what worked well and where you can improve. Let's see if you can close the deal! Say 'START training' when you're ready.";

function InteractiveAvatar() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();
  const { setIsMuted } = useStreamingAvatarContext();

  const [config, setConfig] = useState<StartAvatarRequest>(DEFAULT_CONFIG);

  const mediaStream = useRef<HTMLVideoElement>(null);

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
      await avatar.speak({
        text: AVATAR_INTRO,
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

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-4 sm:py-8">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-10 items-center px-1 sm:px-6">
        <div className="bg-white rounded-xl p-6 sm:p-10 w-full mb-2 mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-2">Meet Alex Carter</h1>
          <p className="text-lg sm:text-xl text-gray-700 mb-2 font-semibold">The AI Buyer Who Never Says Yes Easily</p>
          <p className="text-base sm:text-lg text-gray-700 mb-4">In this interactive simulation, you will step into real-life customer scenarios to sharpen your sales skills. Guided by proven sales frameworks, you'll practice handling objections, asking powerful questions, and closing deals — all in a safe, AI-driven environment designed to make you a better sales manager.</p>
          <div className="mb-4">
            <div className="font-semibold mb-1 text-lg sm:text-xl">✅ Before You Start</div>
            <ul className="list-disc list-inside text-base sm:text-lg text-gray-700 ml-2">
              <li>Use <b>headphones</b> for the best experience</li>
              <li>Ensure a <b>stable internet connection</b> – the avatar requires good connectivity</li>
              <li>Be <b>patient</b> – responses can take 10–15 seconds</li>
              <li>This is <b>AI, not a human</b> – it's not perfect, but it's a powerful way to learn</li>
            </ul>
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-1 text-lg sm:text-xl">🎯 Your Role</div>
            <ul className="list-disc list-inside text-base sm:text-lg text-gray-700 ml-2">
              <li><b>You</b> are the <b>sales manager</b> – your job is to lead the conversation like you would with a real customer.</li>
              <li>The avatar plays the role of your <b>customer</b> – they will respond naturally based on your input.</li>
              <li>If the avatar behaves unnaturally or breaks character, simply say:<br /><span className="italic">"Stay in the role of your prompt."</span></li>
            </ul>
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-1 text-lg sm:text-xl">🛠️ How to Use</div>
            <ol className="list-decimal list-inside text-base sm:text-lg text-gray-700 ml-2">
              <li>Click 'Chat now' to begin</li>
              <li>Say <b>"Start training"</b> to begin the session.</li>
              <li>Navigate customer conversations using open, thoughtful questions that uncover needs, build trust, and move the deal forward.</li>
              <li>Say:<b>"End training and give feedback."</b></li>
              <li>Receive <b>personalized feedback</b> on your sales skills</li>
            </ol>
          </div>
          <div className="mb-2">
            <div className="font-semibold mb-1 text-lg sm:text-xl">🔍 Want to Get Better?</div>
            <ul className="list-disc list-inside text-base sm:text-lg text-gray-700 ml-2">
              <li><span className="italic">"Can you give me more detailed feedback on [specific area]?"</span></li>
              <li><span className="italic">"What should I practice next?"</span></li>
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
                  Chat now
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
