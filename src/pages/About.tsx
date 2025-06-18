export default function About() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        About Rubber Duck Tarot
      </h1>
      <div className="prose prose-lg mx-auto">
        <p className="text-gray-600 mb-6">
          Rubber Duck Tarot combines the ancient art of tarot reading with the
          modern practice of rubber duck debugging. Just as programmers explain
          their code to a rubber duck to find solutions, our tarot cards offer
          insights and guidance for your development journey.
        </p>
        <p className="text-gray-600 mb-6">
          Whether you're stuck on a bug, contemplating architecture decisions,
          or seeking inspiration for your next project, let the cards guide your
          path forward.
        </p>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          How It Works
        </h2>
        <p className="text-gray-600">
          Draw cards from our specialized deck designed for developers and
          techies. Each card offers wisdom tailored to the challenges and
          opportunities in the world of software development.
        </p>
      </div>
    </div>
  );
}
