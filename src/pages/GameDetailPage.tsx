import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Users,
  Package,
  ChevronDown,
  ChevronUp,
  Dices,
  BookOpen,
  Trophy,
  Shuffle,
  Play,
} from 'lucide-react';
import gamesData from '../data/games.json';
import type { Game, YahtzeeGame, PokerGame, RideBusGame } from '../types/game';
import YahtzeeSimulation from '../components/YahtzeeSimulation';
import PokerSimulation from '../components/PokerSimulation';
import RideBusSimulation from '../components/RideBusSimulation';

const games = gamesData.games as Game[];

type TabId = 'overview' | 'setup' | 'rules' | 'scoring' | 'variations' | 'simulate';

const difficultyColors: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  hard: 'bg-red-100 text-red-700 border-red-200',
};

function CollapsibleSection({ title, children, defaultOpen = true }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-stone-50 hover:bg-stone-100 transition-colors text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-stone-700">{title}</span>
        {open ? <ChevronUp size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

function StepList({ steps }: { steps: { step: number; title: string; description: string }[] }) {
  return (
    <ol className="space-y-4">
      {steps.map((s) => (
        <li key={s.step} className="flex gap-4">
          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
            {s.step}
          </div>
          <div>
            <h4 className="font-semibold text-stone-800 mb-0.5">{s.title}</h4>
            <p className="text-stone-600 text-sm leading-relaxed">{s.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function YahtzeeContent({ game, activeTab }: { game: YahtzeeGame; activeTab: TabId }) {
  if (activeTab === 'overview') {
    return (
      <div className="space-y-4">
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <Trophy size={16} /> Objective
          </h3>
          <p className="text-amber-900 text-sm leading-relaxed">{game.objective}</p>
        </div>
        <CollapsibleSection title="Equipment Needed">
          <div className="flex items-start gap-3">
            <Package size={18} className="text-stone-400 mt-0.5 shrink-0" />
            <p className="text-stone-600 text-sm">{game.equipment}</p>
          </div>
        </CollapsibleSection>
        <CollapsibleSection title="Quick Summary: Sample Turn">
          <p className="text-sm text-stone-500 mb-3 italic">{game.sampleTurn.description}</p>
          <div className="space-y-3">
            {game.sampleTurn.rolls.map((r) => (
              <div key={r.roll} className="bg-stone-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-stone-500 bg-stone-200 px-2 py-0.5 rounded-full">
                    Roll {r.roll}
                  </span>
                  <span className="text-sm font-mono text-stone-700">
                    {r.dice.map((v) => ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][v - 1]).join(' ')}
                  </span>
                  {r.kept && (
                    <span className="text-xs text-amber-600 ml-auto">
                      Keep: {r.kept.map((v) => ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][v - 1]).join(' ')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500">{r.note}</p>
              </div>
            ))}
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-sm font-semibold text-emerald-700">
              Result: {game.sampleTurn.combination} — {game.sampleTurn.points} points!
            </div>
          </div>
        </CollapsibleSection>
      </div>
    );
  }

  if (activeTab === 'setup') {
    return (
      <div className="space-y-4">
        <p className="text-stone-500 text-sm">Follow these steps to set up your Yahtzee game:</p>
        <StepList steps={game.setup} />
      </div>
    );
  }

  if (activeTab === 'rules') {
    return (
      <div className="space-y-4">
        <p className="text-stone-500 text-sm">How a turn works in Yahtzee:</p>
        <StepList steps={game.gameplay} />
      </div>
    );
  }

  if (activeTab === 'scoring') {
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <h3 className="font-semibold text-stone-700">Upper Section</h3>
          {game.scoring.filter(s => ['Aces','Twos','Threes','Fours','Fives','Sixes'].includes(s.name)).map((cat) => (
            <div key={cat.name} className="border border-stone-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-stone-50">
                <span className="font-semibold text-stone-700">{cat.name}</span>
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  {cat.points}
                </span>
              </div>
              <div className="px-4 py-2.5">
                <p className="text-sm text-stone-600 mb-1">{cat.description}</p>
                {cat.example && <p className="text-xs text-stone-400 font-mono">{cat.example}</p>}
              </div>
            </div>
          ))}
          {/* Upper bonus */}
          {game.scoring.filter(s => s.name === 'Upper Section Bonus').map((cat) => (
            <div key={cat.name} className="border-2 border-amber-200 bg-amber-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-amber-800">{cat.name}</span>
                <span className="font-bold text-amber-700">+35 pts</span>
              </div>
              <p className="text-sm text-amber-700">{cat.example}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3 mt-6">
          <h3 className="font-semibold text-stone-700">Lower Section</h3>
          {game.scoring.filter(s => !['Aces','Twos','Threes','Fours','Fives','Sixes','Upper Section Bonus'].includes(s.name)).map((cat) => (
            <div key={cat.name} className="border border-stone-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-stone-50">
                <span className="font-semibold text-stone-700">{cat.name}</span>
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  {cat.points}
                </span>
              </div>
              <div className="px-4 py-2.5">
                <p className="text-sm text-stone-600 mb-1">{cat.description}</p>
                {cat.example && <p className="text-xs text-stone-400 font-mono">{cat.example}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'variations') {
    return (
      <div className="space-y-3">
        {game.variations.map((v) => (
          <div key={v.name} className="border border-stone-200 rounded-xl p-4">
            <h4 className="font-semibold text-stone-800 mb-1">{v.name}</h4>
            <p className="text-sm text-stone-600">{v.description}</p>
          </div>
        ))}
      </div>
    );
  }

  if (activeTab === 'simulate') {
    return <YahtzeeSimulation />;
  }

  return null;
}

function PokerContent({ game, activeTab }: { game: PokerGame; activeTab: TabId }) {
  if (activeTab === 'overview') {
    return (
      <div className="space-y-4">
        <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
          <h3 className="font-semibold text-rose-800 mb-2 flex items-center gap-2">
            <Trophy size={16} /> Objective
          </h3>
          <p className="text-rose-900 text-sm leading-relaxed">{game.objective}</p>
        </div>

        <CollapsibleSection title="Betting Rounds Overview">
          <div className="space-y-3">
            {game.bettingRounds.map((round) => (
              <div key={round.name} className="flex gap-3 items-start">
                <div className="w-20 shrink-0 text-xs font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded text-center">
                  {round.name}
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-500 mb-0.5">{round.cards}</p>
                  <p className="text-sm text-stone-600">{round.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Sample Hand">
          <p className="text-sm text-stone-500 mb-3 italic">{game.sampleHand.description}</p>
          <div className="space-y-2">
            {game.sampleHand.action.map((a, i) => (
              <div key={i} className="bg-stone-50 rounded-lg p-3">
                <div className="text-xs font-bold text-stone-500 mb-1">{a.street}</div>
                <p className="text-sm text-stone-600">{a.description}</p>
              </div>
            ))}
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-sm font-semibold text-emerald-700">
              {game.sampleHand.result}
            </div>
          </div>
        </CollapsibleSection>
      </div>
    );
  }

  if (activeTab === 'setup') {
    return (
      <div className="space-y-4">
        <p className="text-stone-500 text-sm">How to set up a Texas Hold'em game:</p>
        <StepList steps={game.setup} />
      </div>
    );
  }

  if (activeTab === 'rules') {
    return (
      <div className="space-y-4">
        <p className="text-stone-500 text-sm">The flow of a complete Texas Hold'em hand:</p>
        <StepList steps={game.gameplay} />
      </div>
    );
  }

  if (activeTab === 'scoring') {
    return (
      <div className="space-y-3">
        <p className="text-stone-500 text-sm">Hand rankings from strongest to weakest:</p>
        {game.handRankings.map((h) => (
          <div key={h.rank} className="flex items-start gap-4 border border-stone-200 rounded-xl p-4">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
              h.rank <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500'
            }`}>
              {h.rank}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-0.5 flex-wrap">
                <h4 className="font-bold text-stone-800">{h.name}</h4>
                <code className="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-mono">{h.example}</code>
              </div>
              <p className="text-sm text-stone-600">{h.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activeTab === 'variations') {
    return (
      <div className="space-y-3">
        {game.variations.map((v) => (
          <div key={v.name} className="border border-stone-200 rounded-xl p-4">
            <h4 className="font-semibold text-stone-800 mb-1">{v.name}</h4>
            <p className="text-sm text-stone-600">{v.description}</p>
          </div>
        ))}
      </div>
    );
  }

  if (activeTab === 'simulate') {
    return <PokerSimulation />;
  }

  return null;
}

function RideBusContent({ game, activeTab }: { game: RideBusGame; activeTab: TabId }) {
  if (activeTab === 'overview') {
    return (
      <div className="space-y-4">
        {/* Age warning */}
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
          <span className="text-red-500 text-lg shrink-0">⚠️</span>
          <p className="text-red-700 text-sm font-medium">{game.ageWarning}</p>
        </div>

        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
          <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
            <Trophy size={16} /> Objective
          </h3>
          <p className="text-orange-900 text-sm leading-relaxed">{game.objective}</p>
        </div>

        <CollapsibleSection title="Equipment Needed">
          <div className="flex items-start gap-3">
            <Package size={18} className="text-stone-400 mt-0.5 shrink-0" />
            <p className="text-stone-600 text-sm">{game.equipment}</p>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Sample Round — One Player's Night">
          <p className="text-sm text-stone-500 mb-3 italic">{game.sampleHand.description}</p>
          <div className="mb-3">
            <p className="text-xs text-stone-400 mb-2">Final hand collected:</p>
            <div className="flex gap-1.5 flex-wrap">
              {game.sampleHand.holeCards.map((c, i) => (
                <span key={i} className={`font-bold text-base px-2 py-1 rounded border ${c.endsWith('♥') || c.endsWith('♦') ? 'text-red-600 border-red-200 bg-red-50' : 'text-stone-800 border-stone-200 bg-stone-50'}`}>{c}</span>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {game.sampleHand.action.map((a, i) => (
              <div key={i} className="bg-stone-50 rounded-lg p-3">
                <div className="text-xs font-bold text-stone-500 mb-0.5">{a.street}</div>
                <p className="text-sm text-stone-600">{a.description}</p>
              </div>
            ))}
            <div className="bg-red-50 rounded-lg p-3 border border-red-100 text-sm font-semibold text-red-700">
              {game.sampleHand.result}
            </div>
          </div>
        </CollapsibleSection>
      </div>
    );
  }

  if (activeTab === 'setup') {
    return (
      <div className="space-y-4">
        <p className="text-stone-500 text-sm">Get the game ready in 4 steps:</p>
        <StepList steps={game.setup} />
      </div>
    );
  }

  if (activeTab === 'rules') {
    return (
      <div className="space-y-4">
        <p className="text-stone-500 text-sm">The 6 phases of Ride the Bus:</p>
        <StepList steps={game.gameplay} />
      </div>
    );
  }

  if (activeTab === 'scoring') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          {game.scoring.map((rule, i) => (
            <div key={i} className="flex gap-3 items-start border border-stone-200 rounded-xl p-3.5">
              <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-sm text-stone-600">{rule}</p>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-4">
          <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-3">💡 Strategy Tips</h4>
          <ul className="space-y-2">
            {game.strategyTips.map((tip, i) => (
              <li key={i} className="text-sm text-blue-700 flex gap-2">
                <span className="shrink-0 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (activeTab === 'variations') {
    return (
      <div className="space-y-3">
        {game.variations.map((v) => (
          <div key={v.name} className="border border-stone-200 rounded-xl p-4">
            <h4 className="font-semibold text-stone-800 mb-1">{v.name}</h4>
            <p className="text-sm text-stone-600">{v.description}</p>
          </div>
        ))}
      </div>
    );
  }

  if (activeTab === 'simulate') {
    return <RideBusSimulation />;
  }

  return null;
}

export default function GameDetailPage() {
  const { id } = useParams<{ id: string }>();
  const game = games.find((g) => g.id === id);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🎲</div>
          <h2 className="text-2xl font-bold text-stone-700 mb-2">Game not found</h2>
          <Link to="/" className="text-amber-600 hover:text-amber-700 font-medium">
            ← Back to all games
          </Link>
        </div>
      </div>
    );
  }

  const isCard = game.type === 'card';
  const accentFrom = isCard ? 'from-rose-400' : 'from-amber-400';
  const accentTo = isCard ? 'to-pink-500' : 'to-orange-500';
  const headerBg = isCard ? 'from-rose-50 via-pink-50 to-rose-50' : 'from-amber-50 via-orange-50 to-amber-50';
  const accentText = isCard ? 'text-rose-600' : 'text-amber-600';

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BookOpen size={14} /> },
    { id: 'setup', label: 'Setup', icon: <Package size={14} /> },
    { id: 'rules', label: 'Rules', icon: <BookOpen size={14} /> },
    { id: 'scoring', label: game.id === 'texas-holdem' ? 'Hand Rankings' : game.id === 'ride-the-bus' ? 'Scoring & Tips' : 'Scoring', icon: <Trophy size={14} /> },
    { id: 'variations', label: 'Variations', icon: <Shuffle size={14} /> },
    { id: 'simulate', label: 'Try It', icon: <Play size={14} /> },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className={`bg-gradient-to-br ${headerBg} border-b border-stone-200`}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-stone-400 hover:text-stone-600 text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={15} />
            All games
          </Link>

          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${accentFrom} ${accentTo} flex items-center justify-center shadow-md shrink-0`}>
              {isCard
                ? <span className="text-3xl text-white">♠</span>
                : <Dices size={28} className="text-white" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-800 leading-tight">{game.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className={`text-sm font-medium capitalize ${accentText}`}>{game.type} game</span>
                <span className="text-stone-300">·</span>
                <span className="flex items-center gap-1 text-sm text-stone-500">
                  <Users size={13} /> {game.players} players
                </span>
                <span className="text-stone-300">·</span>
                <span className="flex items-center gap-1 text-sm text-stone-500">
                  <Clock size={13} /> ~{game.timeMinutes} min
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border capitalize ${difficultyColors[game.difficulty]}`}>
                  {game.difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-stone-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-0 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors shrink-0',
                  activeTab === tab.id
                    ? `border-current ${accentText}`
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300',
                ].join(' ')}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 fade-in">
        {game.id === 'yahtzee' && (
          <YahtzeeContent game={game as YahtzeeGame} activeTab={activeTab} />
        )}
        {game.id === 'texas-holdem' && (
          <PokerContent game={game as PokerGame} activeTab={activeTab} />
        )}
        {game.id === 'ride-the-bus' && (
          <RideBusContent game={game as RideBusGame} activeTab={activeTab} />
        )}
      </div>
    </div>
  );
}
