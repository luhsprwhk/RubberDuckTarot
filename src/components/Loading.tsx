import robEmoji from '@/src/assets/rob-emoji.png';

const Loading = ({ text }: { text?: string }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-void-gradient min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <img
            src={robEmoji}
            alt="Rob"
            className="w-16 h-16 mx-auto animate-bounce"
          />
        </div>
        <h2 className="text-2xl text-primary font-semibold mb-4">
          {text || null}
        </h2>
        <div className="animate-spin rounded-full h-12 w-12 border-liminal-border mx-auto"></div>
      </div>
    </div>
  );
};

export default Loading;
