import Navbar from '../components/Layout/Navbar';
import PianoKeyboard from '../components/Piano/PianoKeyboard';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <Navbar />
      <div>
        <PianoKeyboard />
      </div>
    </div>
  );
}