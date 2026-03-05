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
import type { Game, YahtzeeGame, PokerGame, RideBusGame, TeenPattiGame, BlackjackGame, CrapsGame } from '../types/game';
import YahtzeeSimulation from '../components/YahtzeeSimulation';
import PokerSimulation from '../components/PokerSimulation';
import RideBusSimulation from '../components/RideBusSimulation';
import TeenPattiSimulation from '../components/TeenPattiSimulation';
import BlackjackSimulation from '../components/BlackjackSimulation';
import CrapsSimulation from '../components/CrapsSimulation';

const games = gamesData.games as Game[];

type TabId = 'overview' | 'setup' | 'rules' | 'scoring' | 'variations' | 'simulate';

const GAMES_WITH_SIMULATION = new Set(['yahtzee', 'texas-holdem', 'ride-the-bus', 'teen-patti', 'blackjack', 'craps']);


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
    <ol className="space-y-0">
      {steps.map((s, idx) => (
        <li key={s.step} className="flex gap-4 relative">
          {idx < steps.length - 1 && (
            <div className="absolute left-3.5 top-7 bottom-0 w-px bg-amber-100" />
          )}
          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 relative z-10">
            {s.step}
          </div>
          <div className="pb-5">
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

function VariationCards({ variations }: { variations: { name: string; description: string }[] }) {
  return (
    <div className="space-y-3">
      {variations.map((v) => (
        <div key={v.name} className="border border-stone-200 rounded-xl p-4">
          <h4 className="font-semibold text-stone-800 mb-1">{v.name}</h4>
          <p className="text-sm text-stone-600">{v.description}</p>
        </div>
      ))}
    </div>
  );
}

function StrategyTips({ tips }: { tips: string[] }) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
      <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-3">Strategy Tips</h4>
      <ul className="space-y-2">
        {tips.map((tip, i) => (
          <li key={i} className="text-sm text-blue-700 flex gap-2">
            <span className="shrink-0 mt-0.5">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TeenPattiContent({ game, activeTab, onViewRules }: { game: TeenPattiGame; activeTab: TabId; onViewRules: () => void }) {
  if (activeTab === 'overview') {
    return (
      <div className="space-y-4">
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <Trophy size={16} /> Objective
          </h3>
          <p className="text-amber-900 text-sm leading-relaxed">{game.objective}</p>
        </div>

        <CollapsibleSection title="Cultural Notes">
          <ul className="space-y-2">
            {game.culturalNotes.map((note, i) => (
              <li key={i} className="text-sm text-stone-600 flex gap-2">
                <span className="shrink-0">🇮🇳</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>

        <CollapsibleSection title="Sample Hand">
          <p className="text-sm text-stone-500 mb-3 italic">{game.sampleHand.description}</p>
          <div className="mb-3 flex items-center gap-2 text-sm text-stone-500">
            <span>Boot:</span>
            <span className="font-bold text-amber-700">₹{game.sampleHand.boot}</span>
            <span>|</span>
            <span>Pot:</span>
            <span className="font-bold text-amber-700">₹{game.sampleHand.potSize}</span>
          </div>
          <div className="space-y-2 mb-3">
            {game.sampleHand.players.map((p) => (
              <div key={p.name} className="bg-stone-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-700">{p.name}</span>
                  <span className="text-xs text-amber-600 font-medium">{p.hand}</span>
                </div>
                <div className="flex gap-1 mb-1">
                  {p.cards.map((c, i) => (
                    <span key={i} className={`text-xs px-1.5 py-0.5 rounded font-mono font-bold border ${
                      c === 'Hidden' ? 'bg-stone-800 text-stone-100 border-stone-700' :
                      c.endsWith('♥') || c.endsWith('♦') ? 'text-red-600 border-red-200 bg-red-50' :
                      'text-stone-800 border-stone-200 bg-white'
                    }`}>{c}</span>
                  ))}
                </div>
                <p className="text-xs text-stone-500">{p.action}</p>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 text-sm font-semibold text-amber-800">
            {game.sampleHand.outcome}
          </div>
        </CollapsibleSection>
      </div>
    );
  }

  if (activeTab === 'setup') {
    return (
      <div className="space-y-4">
        <p className="text-stone-500 text-sm">Set up Teen Patti in 5 steps:</p>
        <StepList steps={game.setup} />
      </div>
    );
  }

  if (activeTab === 'rules') {
    return (
      <div className="space-y-4">
        <p className="text-stone-500 text-sm">The four phases of a Teen Patti hand:</p>
        <div className="space-y-3">
          {game.gameplay.map((phase, i) => (
            <div key={i} className="border border-stone-200 rounded-xl overflow-hidden">
              <div className="bg-amber-50 px-4 py-2.5 border-b border-amber-100">
                <h4 className="font-semibold text-amber-800">{phase.phase}</h4>
              </div>
              <div className="p-4 space-y-2">
                <p className="text-sm text-stone-600">{phase.description}</p>
                {phase.rules && (
                  <ul className="mt-2 space-y-1">
                    {phase.rules.map((r, j) => (
                      <li key={j} className="text-xs text-stone-500 flex gap-2">
                        <span className="shrink-0 text-amber-500">›</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                )}
                {phase.note && (
                  <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100 mt-2">
                    💡 {phase.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        <CollapsibleSection title="General Rules" defaultOpen={false}>
          <ul className="space-y-1.5">
            {game.rules.map((r, i) => (
              <li key={i} className="text-sm text-stone-600 flex gap-2">
                <span className="shrink-0 text-amber-500">›</span>
                {r}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
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
              h.rank <= 2 ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500'
            }`}>
              {h.rank}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-0.5 flex-wrap">
                <h4 className="font-bold text-stone-800">{h.name}</h4>
                <code className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-mono">{h.example}</code>
              </div>
              <p className="text-sm text-stone-600">{h.description}</p>
              {h.note && <p className="text-xs text-stone-400 mt-1">{h.note}</p>}
            </div>
          </div>
        ))}
        <CollapsibleSection title="Betting Terms" defaultOpen={false}>
          <ul className="space-y-1.5">
            {game.betting.map((b, i) => (
              <li key={i} className="text-sm text-stone-600 flex gap-2">
                <span className="shrink-0 text-amber-500 font-bold">›</span>
                {b}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
        <StrategyTips tips={game.strategyTips} />
      </div>
    );
  }

  if (activeTab === 'variations') {
    return <VariationCards variations={game.variations} />;
  }

  if (activeTab === 'simulate') {
    return (
      <div className="space-y-3">
        <TeenPattiSimulation onViewRules={onViewRules} />
        <p className="text-xs text-stone-400 leading-relaxed px-1">
          <strong className="text-stone-500">Simulation assumes:</strong> 4-player table · Boot ₹10/player (₹40 starting pot) · Chaal (current stake) ₹20 · Seen costs ₹30 total (boot + chaal), Blind costs ₹20 (boot + half chaal) · Dealer always plays seen and calls at ₹20. Win = collect the full pot.
        </p>
      </div>
    );
  }

  return null;
}

function BlackjackContent({ game, activeTab, onViewRules }: { game: BlackjackGame; activeTab: TabId; onViewRules: () => void }) {
  if (activeTab === 'overview') {
    return (
      <div className="space-y-4">
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <h3 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
            <Trophy size={16} /> Objective
          </h3>
          <p className="text-emerald-900 text-sm leading-relaxed">{game.objective}</p>
        </div>

        <CollapsibleSection title="Card Values">
          <ul className="space-y-2">
            {game.cardValues.map((v, i) => (
              <li key={i} className="text-sm text-stone-600 flex gap-2 items-start">
                <span className="shrink-0 text-emerald-500 font-bold mt-0.5">›</span>
                {v}
              </li>
            ))}
          </ul>
        </CollapsibleSection>

        <CollapsibleSection title="Sample Hand">
          <p className="text-sm text-stone-500 mb-3 italic">{game.sampleHand.description}</p>
          <div className="mb-3 bg-stone-800 rounded-lg p-3">
            <p className="text-stone-400 text-xs mb-2">Dealer</p>
            <div className="flex gap-2 items-center">
              <span className="text-white font-mono text-sm font-bold">{game.sampleHand.dealer.upCard}</span>
              <span className="text-stone-500">+</span>
              <span className="text-stone-500 font-mono text-sm">{game.sampleHand.dealer.holeCard}</span>
              <span className="text-stone-400 text-xs ml-auto">= {game.sampleHand.dealer.total}</span>
            </div>
            <p className="text-stone-400 text-xs mt-1">{game.sampleHand.dealer.action}</p>
          </div>
          <div className="space-y-2">
            {game.sampleHand.players.map((p, i) => (
              <div key={i} className="bg-stone-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-700">{p.name}</span>
                  {p.total && <span className="text-xs font-mono text-emerald-700">{p.total}</span>}
                </div>
                <div className="flex gap-1 mb-1">
                  {p.initialCards.map((c, j) => (
                    <span key={j} className={`text-xs px-1.5 py-0.5 rounded font-mono font-bold border ${
                      c.endsWith('♥') || c.endsWith('♦') ? 'text-red-600 border-red-200 bg-red-50' : 'text-stone-800 border-stone-200 bg-white'
                    }`}>{c}</span>
                  ))}
                </div>
                <p className="text-xs text-stone-500 mb-1">{p.action}</p>
                <p className="text-xs font-semibold text-stone-700">{p.outcome}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      </div>
    );
  }

  if (activeTab === 'setup') {
    return (
      <div className="space-y-4">
        <p className="text-stone-500 text-sm">Setting up a Blackjack game:</p>
        <StepList steps={game.setup} />
      </div>
    );
  }

  if (activeTab === 'rules') {
    return (
      <div className="space-y-4">
        <p className="text-stone-500 text-sm">How a round of Blackjack flows:</p>
        <div className="space-y-3">
          {game.gameplay.map((phase, i) => (
            <div key={i} className="border border-stone-200 rounded-xl overflow-hidden">
              <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100">
                <h4 className="font-semibold text-emerald-800">{phase.phase}</h4>
              </div>
              <div className="p-4 space-y-2">
                <p className="text-sm text-stone-600">{phase.description}</p>
                {phase.actions && (
                  <div className="mt-2 space-y-2">
                    {phase.actions.map((a) => (
                      <div key={a.name} className="flex gap-3 items-start">
                        <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded shrink-0">{a.name}</span>
                        <p className="text-xs text-stone-500">{a.description}</p>
                      </div>
                    ))}
                  </div>
                )}
                {phase.rules && (
                  <ul className="mt-2 space-y-1">
                    {phase.rules.map((r, j) => (
                      <li key={j} className="text-xs text-stone-500 flex gap-2">
                        <span className="shrink-0 text-emerald-500">›</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                )}
                {phase.outcomes && (
                  <ul className="mt-2 space-y-1">
                    {phase.outcomes.map((o, j) => (
                      <li key={j} className="text-xs text-stone-500 flex gap-2">
                        <span className="shrink-0 text-emerald-500">›</span>
                        {o}
                      </li>
                    ))}
                  </ul>
                )}
                {phase.note && (
                  <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-100 mt-2">
                    💡 {phase.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'scoring') {
    return (
      <div className="space-y-4">
        <p className="text-stone-500 text-sm">Basic strategy — the mathematically optimal play for every situation:</p>
        {game.basicStrategy.map((section) => (
          <div key={section.situation} className="border border-stone-200 rounded-xl overflow-hidden">
            <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100">
              <h4 className="font-semibold text-emerald-800">{section.situation}</h4>
            </div>
            <ul className="p-4 space-y-1.5">
              {section.rules.map((r, i) => (
                <li key={i} className="text-sm text-stone-600 flex gap-2">
                  <span className="shrink-0 text-emerald-500">›</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <StrategyTips tips={game.strategyTips} />
      </div>
    );
  }

  if (activeTab === 'variations') {
    return <VariationCards variations={game.variations} />;
  }

  if (activeTab === 'simulate') {
    return <BlackjackSimulation onViewRules={onViewRules} />;
  }

  return null;
}

function CrapsContent({ game, activeTab, onViewRules }: { game: CrapsGame; activeTab: TabId; onViewRules: () => void }) {
  if (activeTab === 'overview') {
    return (
      <div className="space-y-4">
        <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
          <h3 className="font-semibold text-violet-800 mb-2 flex items-center gap-2">
            <Trophy size={16} /> Objective
          </h3>
          <p className="text-violet-900 text-sm leading-relaxed">{game.objective}</p>
        </div>

        <CollapsibleSection title="Dice Probabilities">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {game.diceRollProbabilities.map((p, i) => (
              <div key={i} className="bg-stone-50 rounded-lg p-2 text-center">
                <p className="text-xs text-stone-500 leading-snug">{p}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Sample Round">
          <p className="text-sm text-stone-500 mb-3 italic">{game.sampleRound.description}</p>
          <div className="mb-2 flex gap-3 text-sm text-stone-500">
            <span>Shooter: <strong className="text-stone-700">{game.sampleRound.shooter}</strong></span>
            <span>|</span>
            <span>Bet: <strong className="text-stone-700">{game.sampleRound.bet}</strong></span>
          </div>
          <div className="space-y-2">
            {game.sampleRound.rolls.map((r) => (
              <div key={r.rollNumber} className="bg-stone-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-500">Roll #{r.rollNumber} — {r.phase}</span>
                  <span className="font-mono text-sm font-bold text-stone-800">{r.dice[0]}+{r.dice[1]}={r.total}</span>
                </div>
                <p className="text-xs text-stone-600">{r.result}</p>
                <p className="text-xs text-stone-400 mt-0.5">{r.betStatus}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Etiquette & Terminology" defaultOpen={false}>
          <div className="space-y-1.5">
            {game.etiquette.slice(0, 4).map((e, i) => (
              <p key={i} className="text-sm text-stone-600 flex gap-2">
                <span className="shrink-0">🎲</span>
                {e}
              </p>
            ))}
          </div>
        </CollapsibleSection>
      </div>
    );
  }

  if (activeTab === 'setup') {
    return (
      <div className="space-y-4">
        <p className="text-stone-500 text-sm">Getting a craps game started:</p>
        <StepList steps={game.setup} />
      </div>
    );
  }

  if (activeTab === 'rules') {
    return (
      <div className="space-y-4">
        <p className="text-stone-500 text-sm">How dice outcomes determine wins and losses:</p>
        <div className="space-y-4">
          {game.gameplay.map((phase, i) => (
            <div key={i} className="border border-stone-200 rounded-xl overflow-hidden">
              <div className="bg-violet-50 px-4 py-2.5 border-b border-violet-100">
                <h4 className="font-semibold text-violet-800">{phase.phase}</h4>
              </div>
              <div className="p-4">
                <p className="text-sm text-stone-600 mb-3">{phase.description}</p>
                {phase.outcomes && (
                  <div className="space-y-2">
                    {phase.outcomes.map((o, j) => (
                      <div key={j} className="flex gap-3 items-start bg-stone-50 rounded-lg p-3">
                        <span className="text-xs font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded shrink-0 whitespace-nowrap">{o.roll}</span>
                        <p className="text-xs text-stone-600">{o.result}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <CollapsibleSection title="General Rules" defaultOpen={false}>
          <ul className="space-y-1.5">
            {game.rules.map((r, i) => (
              <li key={i} className="text-sm text-stone-600 flex gap-2">
                <span className="shrink-0 text-violet-500">›</span>
                {r}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      </div>
    );
  }

  if (activeTab === 'scoring') {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-stone-700 mb-3">Core Bets — Start Here</h3>
          <div className="space-y-3">
            {game.basicBets.map((bet) => (
              <div key={bet.name} className="border border-stone-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                  <h4 className="font-bold text-stone-800">{bet.name}</h4>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">{bet.payout}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bet.houseEdge === '0%' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-600'}`}>
                      HE: {bet.houseEdge}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-stone-600 mb-1">{bet.description}</p>
                {bet.strategy && <p className="text-xs text-blue-700 bg-blue-50 rounded px-2 py-1">{bet.strategy}</p>}
                {bet.note && <p className="text-xs text-stone-400 mt-1">{bet.note}</p>}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-stone-700 mb-3">Advanced Bets — Know the Odds</h3>
          <div className="space-y-3">
            {game.advancedBets.map((bet) => (
              <div key={bet.name} className="border border-stone-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                  <h4 className="font-bold text-stone-800">{bet.name}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                    HE: {bet.houseEdge}
                  </span>
                </div>
                <p className="text-sm text-stone-600 mb-1">{bet.description}</p>
                <p className="text-xs text-stone-400">Pays: {bet.payout}</p>
                {bet.strategy && <p className="text-xs text-red-700 bg-red-50 rounded px-2 py-1 mt-1">{bet.strategy}</p>}
              </div>
            ))}
          </div>
        </div>

        <StrategyTips tips={game.strategyTips.slice(0, 5)} />
      </div>
    );
  }

  if (activeTab === 'variations') {
    return <VariationCards variations={game.variations} />;
  }

  if (activeTab === 'simulate') {
    return <CrapsSimulation onViewRules={onViewRules} />;
  }

  return null;
}

export default function GameDetailPage() {
  const { id } = useParams<{ id: string }>();
  const game = games.find((g) => g.id === id);
  const [activeTab, setActiveTab] = useState<TabId>(GAMES_WITH_SIMULATION.has(id ?? '') ? 'simulate' : 'overview');

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

  const gameHeaderGradients: Record<string, string> = {
    'yahtzee': 'from-amber-500 via-orange-500 to-orange-600',
    'texas-holdem': 'from-slate-700 via-indigo-700 to-indigo-800',
    'ride-the-bus': 'from-rose-500 via-red-500 to-rose-600',
    'teen-patti': 'from-yellow-500 via-amber-500 to-amber-600',
    'blackjack': 'from-emerald-600 via-teal-600 to-teal-700',
    'craps': 'from-violet-600 via-purple-600 to-purple-700',
  };
  const gameHeaderIcons: Record<string, React.ReactNode> = {
    'yahtzee': <Dices size={32} className="text-white" />,
    'texas-holdem': <span className="text-4xl text-white">♠</span>,
    'ride-the-bus': <span className="text-3xl">🚌</span>,
    'teen-patti': <span className="text-3xl">🃏</span>,
    'blackjack': <span className="text-3xl font-black text-white">21</span>,
    'craps': <Dices size={32} className="text-white" />,
  };

  const headerGradient = gameHeaderGradients[game.id] ?? (game.type === 'card' ? 'from-rose-500 to-pink-600' : 'from-amber-500 to-orange-600');
  const headerIcon = gameHeaderIcons[game.id] ?? (game.type === 'card' ? <span className="text-4xl text-white">♠</span> : <Dices size={32} className="text-white" />);
  const activePillColors: Record<string, string> = {
    'yahtzee': 'bg-amber-100 text-amber-700',
    'texas-holdem': 'bg-indigo-100 text-indigo-700',
    'ride-the-bus': 'bg-rose-100 text-rose-700',
    'teen-patti': 'bg-amber-100 text-amber-700',
    'blackjack': 'bg-emerald-100 text-emerald-700',
    'craps': 'bg-violet-100 text-violet-700',
  };
  const activePill = activePillColors[game.id] ?? 'bg-amber-100 text-amber-700';

  const handleViewRules = () => setActiveTab('rules');

  const allTabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'simulate', label: 'Try It ✦', icon: <Play size={14} /> },
    { id: 'overview', label: 'Overview', icon: <BookOpen size={14} /> },
    { id: 'setup', label: 'Setup', icon: <Package size={14} /> },
    { id: 'rules', label: 'Rules', icon: <BookOpen size={14} /> },
    { id: 'scoring', label: ({ 'texas-holdem': 'Hand Rankings', 'teen-patti': 'Hand Rankings', 'ride-the-bus': 'Scoring & Tips', 'blackjack': 'Basic Strategy', 'craps': 'Bets' } as Record<string, string>)[game.id] ?? 'Scoring', icon: <Trophy size={14} /> },
    { id: 'variations', label: 'Variations', icon: <Shuffle size={14} /> },
  ];
  const tabs = GAMES_WITH_SIMULATION.has(game.id) ? allTabs : allTabs.filter(t => t.id !== 'simulate');

  return (
    <div className="min-h-screen">
      {/* Header — colorful gradient per game */}
      <div className={`bg-gradient-to-br ${headerGradient} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative max-w-4xl mx-auto px-4 py-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-4 transition-colors font-semibold"
          >
            <ArrowLeft size={15} />
            All games
          </Link>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg shrink-0">
              {headerIcon}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-sm">{game.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="flex items-center gap-1 text-sm text-white/80 font-semibold">
                  <Users size={13} /> {game.players}
                </span>
                <span className="text-white/30">·</span>
                <span className="flex items-center gap-1 text-sm text-white/80 font-semibold">
                  <Clock size={13} /> ~{game.timeMinutes} min
                </span>
                <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-bold capitalize">
                  {game.difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs — pill style */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-stone-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-1 py-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'flex items-center gap-1.5 px-4 py-2 text-sm font-bold whitespace-nowrap rounded-xl transition-all shrink-0',
                  activeTab === tab.id
                    ? `${activePill} shadow-sm`
                    : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100',
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
        {game.id === 'teen-patti' && (
          <TeenPattiContent game={game as TeenPattiGame} activeTab={activeTab} onViewRules={handleViewRules} />
        )}
        {game.id === 'blackjack' && (
          <BlackjackContent game={game as BlackjackGame} activeTab={activeTab} onViewRules={handleViewRules} />
        )}
        {game.id === 'craps' && (
          <CrapsContent game={game as CrapsGame} activeTab={activeTab} onViewRules={handleViewRules} />
        )}
      </div>
    </div>
  );
}
