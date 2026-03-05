import { useState, Suspense } from 'react';
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
import type { Game, YahtzeeGame, PokerGame, RideBusGame, TeenPattiGame, BlackjackGame, CrapsGame, FlipCupGame, AssholeGame, TwentyEightGame, KaaliTeeriGame } from '../types/game';
import { simulationRegistry, SIMULATED_GAMES } from '../engine/registry';

const games = gamesData.games as Game[];

type TabId = 'overview' | 'setup' | 'rules' | 'scoring' | 'variations' | 'simulate';


function CollapsibleSection({ title, children, defaultOpen = true }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(57, 255, 20, 0.15)' }}>
      <button
        className="w-full flex items-center justify-between px-4 py-3 transition-colors text-left"
        style={{ background: 'rgba(13, 42, 24, 0.7)' }}
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold" style={{ color: '#E1B300' }}>{title}</span>
        {open
          ? <ChevronUp size={16} style={{ color: 'rgba(57, 255, 20, 0.5)' }} />
          : <ChevronDown size={16} style={{ color: 'rgba(57, 255, 20, 0.5)' }} />}
      </button>
      {open && <div className="p-4" style={{ background: 'rgba(5, 22, 14, 0.6)' }}>{children}</div>}
    </div>
  );
}

function StepList({ steps }: { steps: { step: number; title: string; description: string }[] }) {
  return (
    <ol className="space-y-0">
      {steps.map((s, idx) => (
        <li key={s.step} className="flex gap-4 relative">
          {idx < steps.length - 1 && (
            <div className="absolute left-3.5 top-7 bottom-0 w-px" style={{ background: 'rgba(225, 179, 0, 0.2)' }} />
          )}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 relative z-10"
            style={{ background: 'rgba(225, 179, 0, 0.15)', color: '#E1B300', border: '1px solid rgba(225, 179, 0, 0.35)' }}
          >
            {s.step}
          </div>
          <div className="pb-5">
            <h4 className="font-semibold mb-0.5" style={{ color: '#d1fae5' }}>{s.title}</h4>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(209, 250, 229, 0.6)' }}>{s.description}</p>
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
        <div className="bg-[#E1B300]/8 rounded-xl p-4 border border-[#E1B300]/20">
          <h3 className="font-semibold text-[#E1B300] mb-2 flex items-center gap-2">
            <Trophy size={16} /> Objective
          </h3>
          <p className="text-[#E1B300] text-sm leading-relaxed">{game.objective}</p>
        </div>
        <CollapsibleSection title="Equipment Needed">
          <div className="flex items-start gap-3">
            <Package size={18} className="text-[#d1fae5]/38 mt-0.5 shrink-0" />
            <p className="text-[#d1fae5]/62 text-sm">{game.equipment}</p>
          </div>
        </CollapsibleSection>
        <CollapsibleSection title="Quick Summary: Sample Turn">
          <p className="text-sm text-[#d1fae5]/48 mb-3 italic">{game.sampleTurn.description}</p>
          <div className="space-y-3">
            {game.sampleTurn.rolls.map((r) => (
              <div key={r.roll} className="bg-[#0d2a18]/60 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#d1fae5]/62 bg-[#0d2a18]/80 border border-[#39FF14]/15 px-2 py-0.5 rounded-full">
                    Roll {r.roll}
                  </span>
                  <span className="text-sm font-mono text-[#d1fae5]/80">
                    {r.dice.map((v) => ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][v - 1]).join(' ')}
                  </span>
                  {r.kept && (
                    <span className="text-xs text-[#E1B300] ml-auto">
                      Keep: {r.kept.map((v) => ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][v - 1]).join(' ')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#d1fae5]/48">{r.note}</p>
              </div>
            ))}
            <div className="bg-emerald-950/30 rounded-lg p-3 border border-emerald-500/20 text-sm font-semibold text-emerald-300">
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
        <p className="text-[#d1fae5]/48 text-sm">Follow these steps to set up your Yahtzee game:</p>
        <StepList steps={game.setup} />
      </div>
    );
  }

  if (activeTab === 'rules') {
    return (
      <div className="space-y-4">
        <p className="text-[#d1fae5]/48 text-sm">How a turn works in Yahtzee:</p>
        <StepList steps={game.gameplay} />
      </div>
    );
  }

  if (activeTab === 'scoring') {
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <h3 className="font-semibold text-[#d1fae5]/80">Upper Section</h3>
          {game.scoring.filter(s => ['Aces','Twos','Threes','Fours','Fives','Sixes'].includes(s.name)).map((cat) => (
            <div key={cat.name} className="border border-[#39FF14]/10 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d2a18]/60">
                <span className="font-semibold text-[#d1fae5]/80">{cat.name}</span>
                <span className="text-xs font-medium text-[#E1B300] bg-[#E1B300]/8 px-2 py-0.5 rounded-full border border-[#E1B300]/20">
                  {cat.points}
                </span>
              </div>
              <div className="px-4 py-2.5">
                <p className="text-sm text-[#d1fae5]/62 mb-1">{cat.description}</p>
                {cat.example && <p className="text-xs text-[#d1fae5]/38 font-mono">{cat.example}</p>}
              </div>
            </div>
          ))}
          {/* Upper bonus */}
          {game.scoring.filter(s => s.name === 'Upper Section Bonus').map((cat) => (
            <div key={cat.name} className="border-2 border-amber-200 bg-[#E1B300]/8 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[#E1B300]">{cat.name}</span>
                <span className="font-bold text-[#E1B300]">+35 pts</span>
              </div>
              <p className="text-sm text-[#E1B300]">{cat.example}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3 mt-6">
          <h3 className="font-semibold text-[#d1fae5]/80">Lower Section</h3>
          {game.scoring.filter(s => !['Aces','Twos','Threes','Fours','Fives','Sixes','Upper Section Bonus'].includes(s.name)).map((cat) => (
            <div key={cat.name} className="border border-[#39FF14]/10 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d2a18]/60">
                <span className="font-semibold text-[#d1fae5]/80">{cat.name}</span>
                <span className="text-xs font-medium text-[#E1B300] bg-[#E1B300]/8 px-2 py-0.5 rounded-full border border-[#E1B300]/20">
                  {cat.points}
                </span>
              </div>
              <div className="px-4 py-2.5">
                <p className="text-sm text-[#d1fae5]/62 mb-1">{cat.description}</p>
                {cat.example && <p className="text-xs text-[#d1fae5]/38 font-mono">{cat.example}</p>}
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
          <div key={v.name} className="border border-[#39FF14]/10 rounded-xl p-4">
            <h4 className="font-semibold text-[#d1fae5] mb-1">{v.name}</h4>
            <p className="text-sm text-[#d1fae5]/62">{v.description}</p>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

function PokerContent({ game, activeTab }: { game: PokerGame; activeTab: TabId }) {
  if (activeTab === 'overview') {
    return (
      <div className="space-y-4">
        <div className="bg-rose-950/30 rounded-xl p-4 border border-rose-500/20">
          <h3 className="font-semibold text-rose-300 mb-2 flex items-center gap-2">
            <Trophy size={16} /> Objective
          </h3>
          <p className="text-rose-200 text-sm leading-relaxed">{game.objective}</p>
        </div>

        <CollapsibleSection title="Betting Rounds Overview">
          <div className="space-y-3">
            {game.bettingRounds.map((round) => (
              <div key={round.name} className="flex gap-3 items-start">
                <div className="w-20 shrink-0 text-xs font-bold text-[#d1fae5]/62 bg-[#0d2a18]/80 border border-[#39FF14]/15 px-2 py-1 rounded text-center">
                  {round.name}
                </div>
                <div>
                  <p className="text-xs font-medium text-[#d1fae5]/48 mb-0.5">{round.cards}</p>
                  <p className="text-sm text-[#d1fae5]/62">{round.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Sample Hand">
          <p className="text-sm text-[#d1fae5]/48 mb-3 italic">{game.sampleHand.description}</p>
          <div className="space-y-2">
            {game.sampleHand.action.map((a, i) => (
              <div key={i} className="bg-[#0d2a18]/60 rounded-lg p-3">
                <div className="text-xs font-bold text-[#d1fae5]/48 mb-1">{a.street}</div>
                <p className="text-sm text-[#d1fae5]/62">{a.description}</p>
              </div>
            ))}
            <div className="bg-emerald-950/30 rounded-lg p-3 border border-emerald-500/20 text-sm font-semibold text-emerald-300">
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
        <p className="text-[#d1fae5]/48 text-sm">How to set up a Texas Hold'em game:</p>
        <StepList steps={game.setup} />
      </div>
    );
  }

  if (activeTab === 'rules') {
    return (
      <div className="space-y-4">
        <p className="text-[#d1fae5]/48 text-sm">The flow of a complete Texas Hold'em hand:</p>
        <StepList steps={game.gameplay} />
      </div>
    );
  }

  if (activeTab === 'scoring') {
    return (
      <div className="space-y-3">
        <p className="text-[#d1fae5]/48 text-sm">Hand rankings from strongest to weakest:</p>
        {game.handRankings.map((h) => (
          <div key={h.rank} className="flex items-start gap-4 border border-[#39FF14]/10 rounded-xl p-4">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
              h.rank <= 3 ? 'bg-[#E1B300]/12 text-[#E1B300]' : 'bg-[#0d2a18]/80 border border-[#39FF14]/10 text-[#d1fae5]/48'
            }`}>
              {h.rank}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-0.5 flex-wrap">
                <h4 className="font-bold text-[#d1fae5]">{h.name}</h4>
                <code className="text-xs text-rose-300 bg-rose-950/30 px-2 py-0.5 rounded font-mono">{h.example}</code>
              </div>
              <p className="text-sm text-[#d1fae5]/62">{h.description}</p>
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
          <div key={v.name} className="border border-[#39FF14]/10 rounded-xl p-4">
            <h4 className="font-semibold text-[#d1fae5] mb-1">{v.name}</h4>
            <p className="text-sm text-[#d1fae5]/62">{v.description}</p>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

function RideBusContent({ game, activeTab }: { game: RideBusGame; activeTab: TabId }) {
  if (activeTab === 'overview') {
    return (
      <div className="space-y-4">
        {/* Age warning */}
        <div className="bg-red-950/25 border border-red-500/20 rounded-xl px-4 py-3 flex items-start gap-2.5">
          <span className="text-red-500 text-lg shrink-0">⚠️</span>
          <p className="text-red-300 text-sm font-medium">{game.ageWarning}</p>
        </div>

        <div className="bg-orange-950/30 rounded-xl p-4 border border-orange-500/20">
          <h3 className="font-semibold text-orange-300 mb-2 flex items-center gap-2">
            <Trophy size={16} /> Objective
          </h3>
          <p className="text-orange-200 text-sm leading-relaxed">{game.objective}</p>
        </div>

        <CollapsibleSection title="Equipment Needed">
          <div className="flex items-start gap-3">
            <Package size={18} className="text-[#d1fae5]/38 mt-0.5 shrink-0" />
            <p className="text-[#d1fae5]/62 text-sm">{game.equipment}</p>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Sample Round — One Player's Night">
          <p className="text-sm text-[#d1fae5]/48 mb-3 italic">{game.sampleHand.description}</p>
          <div className="mb-3">
            <p className="text-xs text-[#d1fae5]/38 mb-2">Final hand collected:</p>
            <div className="flex gap-1.5 flex-wrap">
              {game.sampleHand.holeCards.map((c, i) => (
                <span key={i} className={`font-bold text-base px-2 py-1 rounded border ${c.endsWith('♥') || c.endsWith('♦') ? 'text-[#ff5555] border-red-500/20 bg-red-950/25' : 'text-[#d1fae5] border-[#39FF14]/10 bg-[#0d2a18]/60'}`}>{c}</span>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {game.sampleHand.action.map((a, i) => (
              <div key={i} className="bg-[#0d2a18]/60 rounded-lg p-3">
                <div className="text-xs font-bold text-[#d1fae5]/48 mb-0.5">{a.street}</div>
                <p className="text-sm text-[#d1fae5]/62">{a.description}</p>
              </div>
            ))}
            <div className="bg-red-950/25 rounded-lg p-3 border border-red-100 text-sm font-semibold text-red-300">
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
        <p className="text-[#d1fae5]/48 text-sm">Get the game ready in 4 steps:</p>
        <StepList steps={game.setup} />
      </div>
    );
  }

  if (activeTab === 'rules') {
    return (
      <div className="space-y-4">
        <p className="text-[#d1fae5]/48 text-sm">The 6 phases of Ride the Bus:</p>
        <StepList steps={game.gameplay} />
      </div>
    );
  }

  if (activeTab === 'scoring') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          {game.scoring.map((rule, i) => (
            <div key={i} className="flex gap-3 items-start border border-[#39FF14]/10 rounded-xl p-3.5">
              <div className="w-6 h-6 rounded-full bg-[#E1B300]/12 text-[#E1B300] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-sm text-[#d1fae5]/62">{rule}</p>
            </div>
          ))}
        </div>

        <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-4 mt-4">
          <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wide mb-3">💡 Strategy Tips</h4>
          <ul className="space-y-2">
            {game.strategyTips.map((tip, i) => (
              <li key={i} className="text-sm text-blue-300 flex gap-2">
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
          <div key={v.name} className="border border-[#39FF14]/10 rounded-xl p-4">
            <h4 className="font-semibold text-[#d1fae5] mb-1">{v.name}</h4>
            <p className="text-sm text-[#d1fae5]/62">{v.description}</p>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

function VariationCards({ variations }: { variations: { name: string; description: string }[] }) {
  return (
    <div className="space-y-3">
      {variations.map((v) => (
        <div key={v.name} className="border border-[#39FF14]/10 rounded-xl p-4">
          <h4 className="font-semibold text-[#d1fae5] mb-1">{v.name}</h4>
          <p className="text-sm text-[#d1fae5]/62">{v.description}</p>
        </div>
      ))}
    </div>
  );
}

function StrategyTips({ tips }: { tips: string[] }) {
  return (
    <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-4">
      <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wide mb-3">Strategy Tips</h4>
      <ul className="space-y-2">
        {tips.map((tip, i) => (
          <li key={i} className="text-sm text-blue-300 flex gap-2">
            <span className="shrink-0 mt-0.5">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TeenPattiContent({ game, activeTab }: { game: TeenPattiGame; activeTab: TabId }) {
  if (activeTab === 'overview') {
    return (
      <div className="space-y-4">
        <div className="bg-[#E1B300]/8 rounded-xl p-4 border border-[#E1B300]/20">
          <h3 className="font-semibold text-[#E1B300] mb-2 flex items-center gap-2">
            <Trophy size={16} /> Objective
          </h3>
          <p className="text-[#E1B300] text-sm leading-relaxed">{game.objective}</p>
        </div>

        <CollapsibleSection title="Cultural Notes">
          <ul className="space-y-2">
            {game.culturalNotes.map((note, i) => (
              <li key={i} className="text-sm text-[#d1fae5]/62 flex gap-2">
                <span className="shrink-0">🇮🇳</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>

        <CollapsibleSection title="Sample Hand">
          <p className="text-sm text-[#d1fae5]/48 mb-3 italic">{game.sampleHand.description}</p>
          <div className="mb-3 flex items-center gap-2 text-sm text-[#d1fae5]/48">
            <span>Boot:</span>
            <span className="font-bold text-[#E1B300]">₹{game.sampleHand.boot}</span>
            <span>|</span>
            <span>Pot:</span>
            <span className="font-bold text-[#E1B300]">₹{game.sampleHand.potSize}</span>
          </div>
          <div className="space-y-2 mb-3">
            {game.sampleHand.players.map((p) => (
              <div key={p.name} className="bg-[#0d2a18]/60 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#d1fae5]/80">{p.name}</span>
                  <span className="text-xs text-[#E1B300] font-medium">{p.hand}</span>
                </div>
                <div className="flex gap-1 mb-1">
                  {p.cards.map((c, i) => (
                    <span key={i} className={`text-xs px-1.5 py-0.5 rounded font-mono font-bold border ${
                      c === 'Hidden' ? 'bg-stone-800 text-stone-100 border-stone-700' :
                      c.endsWith('♥') || c.endsWith('♦') ? 'text-[#ff5555] border-red-500/20 bg-red-950/25' :
                      'text-[#d1fae5] border-[#39FF14]/10 bg-[#0d2a18]/60'
                    }`}>{c}</span>
                  ))}
                </div>
                <p className="text-xs text-[#d1fae5]/48">{p.action}</p>
              </div>
            ))}
          </div>
          <div className="bg-[#E1B300]/8 rounded-lg p-3 border border-[#E1B300]/20 text-sm font-semibold text-[#E1B300]">
            {game.sampleHand.outcome}
          </div>
        </CollapsibleSection>
      </div>
    );
  }

  if (activeTab === 'setup') {
    return (
      <div className="space-y-4">
        <p className="text-[#d1fae5]/48 text-sm">Set up Teen Patti in 5 steps:</p>
        <StepList steps={game.setup} />
      </div>
    );
  }

  if (activeTab === 'rules') {
    return (
      <div className="space-y-4">
        <p className="text-[#d1fae5]/48 text-sm">The four phases of a Teen Patti hand:</p>
        <div className="space-y-3">
          {game.gameplay.map((phase, i) => (
            <div key={i} className="border border-[#39FF14]/10 rounded-xl overflow-hidden">
              <div className="bg-[#E1B300]/8 px-4 py-2.5 border-b border-[#E1B300]/20">
                <h4 className="font-semibold text-[#E1B300]">{phase.phase}</h4>
              </div>
              <div className="p-4 space-y-2">
                <p className="text-sm text-[#d1fae5]/62">{phase.description}</p>
                {phase.rules && (
                  <ul className="mt-2 space-y-1">
                    {phase.rules.map((r, j) => (
                      <li key={j} className="text-xs text-[#d1fae5]/48 flex gap-2">
                        <span className="shrink-0 text-amber-500">›</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                )}
                {phase.note && (
                  <p className="text-xs text-[#E1B300] bg-[#E1B300]/8 rounded-lg px-3 py-2 border border-[#E1B300]/20 mt-2">
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
              <li key={i} className="text-sm text-[#d1fae5]/62 flex gap-2">
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
        <p className="text-[#d1fae5]/48 text-sm">Hand rankings from strongest to weakest:</p>
        {game.handRankings.map((h) => (
          <div key={h.rank} className="flex items-start gap-4 border border-[#39FF14]/10 rounded-xl p-4">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
              h.rank <= 2 ? 'bg-[#E1B300]/12 text-[#E1B300]' : 'bg-[#0d2a18]/80 border border-[#39FF14]/10 text-[#d1fae5]/48'
            }`}>
              {h.rank}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-0.5 flex-wrap">
                <h4 className="font-bold text-[#d1fae5]">{h.name}</h4>
                <code className="text-xs text-[#E1B300] bg-[#E1B300]/8 px-2 py-0.5 rounded font-mono">{h.example}</code>
              </div>
              <p className="text-sm text-[#d1fae5]/62">{h.description}</p>
              {h.note && <p className="text-xs text-[#d1fae5]/38 mt-1">{h.note}</p>}
            </div>
          </div>
        ))}
        <CollapsibleSection title="Betting Terms" defaultOpen={false}>
          <ul className="space-y-1.5">
            {game.betting.map((b, i) => (
              <li key={i} className="text-sm text-[#d1fae5]/62 flex gap-2">
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

  return null;
}

function BlackjackContent({ game, activeTab }: { game: BlackjackGame; activeTab: TabId }) {
  if (activeTab === 'overview') {
    return (
      <div className="space-y-4">
        <div className="bg-emerald-950/30 rounded-xl p-4 border border-emerald-500/20">
          <h3 className="font-semibold text-emerald-300 mb-2 flex items-center gap-2">
            <Trophy size={16} /> Objective
          </h3>
          <p className="text-emerald-200 text-sm leading-relaxed">{game.objective}</p>
        </div>

        <CollapsibleSection title="Card Values">
          <ul className="space-y-2">
            {game.cardValues.map((v, i) => (
              <li key={i} className="text-sm text-[#d1fae5]/62 flex gap-2 items-start">
                <span className="shrink-0 text-emerald-500 font-bold mt-0.5">›</span>
                {v}
              </li>
            ))}
          </ul>
        </CollapsibleSection>

        <CollapsibleSection title="Sample Hand">
          <p className="text-sm text-[#d1fae5]/48 mb-3 italic">{game.sampleHand.description}</p>
          <div className="mb-3 bg-stone-800 rounded-lg p-3">
            <p className="text-[#d1fae5]/38 text-xs mb-2">Dealer</p>
            <div className="flex gap-2 items-center">
              <span className="text-white font-mono text-sm font-bold">{game.sampleHand.dealer.upCard}</span>
              <span className="text-[#d1fae5]/48">+</span>
              <span className="text-[#d1fae5]/48 font-mono text-sm">{game.sampleHand.dealer.holeCard}</span>
              <span className="text-[#d1fae5]/38 text-xs ml-auto">= {game.sampleHand.dealer.total}</span>
            </div>
            <p className="text-[#d1fae5]/38 text-xs mt-1">{game.sampleHand.dealer.action}</p>
          </div>
          <div className="space-y-2">
            {game.sampleHand.players.map((p, i) => (
              <div key={i} className="bg-[#0d2a18]/60 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#d1fae5]/80">{p.name}</span>
                  {p.total && <span className="text-xs font-mono text-emerald-300">{p.total}</span>}
                </div>
                <div className="flex gap-1 mb-1">
                  {p.initialCards.map((c, j) => (
                    <span key={j} className={`text-xs px-1.5 py-0.5 rounded font-mono font-bold border ${
                      c.endsWith('♥') || c.endsWith('♦') ? 'text-[#ff5555] border-red-500/20 bg-red-950/25' : 'text-[#d1fae5] border-[#39FF14]/10 bg-[#0d2a18]/60'
                    }`}>{c}</span>
                  ))}
                </div>
                <p className="text-xs text-[#d1fae5]/48 mb-1">{p.action}</p>
                <p className="text-xs font-semibold text-[#d1fae5]/80">{p.outcome}</p>
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
        <p className="text-[#d1fae5]/48 text-sm">Setting up a Blackjack game:</p>
        <StepList steps={game.setup} />
      </div>
    );
  }

  if (activeTab === 'rules') {
    return (
      <div className="space-y-4">
        <p className="text-[#d1fae5]/48 text-sm">How a round of Blackjack flows:</p>
        <div className="space-y-3">
          {game.gameplay.map((phase, i) => (
            <div key={i} className="border border-[#39FF14]/10 rounded-xl overflow-hidden">
              <div className="bg-emerald-950/30 px-4 py-2.5 border-b border-emerald-500/20">
                <h4 className="font-semibold text-emerald-300">{phase.phase}</h4>
              </div>
              <div className="p-4 space-y-2">
                <p className="text-sm text-[#d1fae5]/62">{phase.description}</p>
                {phase.actions && (
                  <div className="mt-2 space-y-2">
                    {phase.actions.map((a) => (
                      <div key={a.name} className="flex gap-3 items-start">
                        <span className="text-xs font-bold bg-emerald-950/30 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded shrink-0">{a.name}</span>
                        <p className="text-xs text-[#d1fae5]/48">{a.description}</p>
                      </div>
                    ))}
                  </div>
                )}
                {phase.rules && (
                  <ul className="mt-2 space-y-1">
                    {phase.rules.map((r, j) => (
                      <li key={j} className="text-xs text-[#d1fae5]/48 flex gap-2">
                        <span className="shrink-0 text-emerald-500">›</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                )}
                {phase.outcomes && (
                  <ul className="mt-2 space-y-1">
                    {phase.outcomes.map((o, j) => (
                      <li key={j} className="text-xs text-[#d1fae5]/48 flex gap-2">
                        <span className="shrink-0 text-emerald-500">›</span>
                        {o}
                      </li>
                    ))}
                  </ul>
                )}
                {phase.note && (
                  <p className="text-xs text-emerald-300 bg-emerald-950/30 rounded-lg px-3 py-2 border border-emerald-500/20 mt-2">
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
        <p className="text-[#d1fae5]/48 text-sm">Basic strategy — the mathematically optimal play for every situation:</p>
        {game.basicStrategy.map((section) => (
          <div key={section.situation} className="border border-[#39FF14]/10 rounded-xl overflow-hidden">
            <div className="bg-emerald-950/30 px-4 py-2.5 border-b border-emerald-500/20">
              <h4 className="font-semibold text-emerald-300">{section.situation}</h4>
            </div>
            <ul className="p-4 space-y-1.5">
              {section.rules.map((r, i) => (
                <li key={i} className="text-sm text-[#d1fae5]/62 flex gap-2">
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

  return null;
}

function CrapsContent({ game, activeTab }: { game: CrapsGame; activeTab: TabId }) {
  if (activeTab === 'overview') {
    return (
      <div className="space-y-4">
        <div className="bg-violet-950/30 rounded-xl p-4 border border-violet-500/20">
          <h3 className="font-semibold text-violet-300 mb-2 flex items-center gap-2">
            <Trophy size={16} /> Objective
          </h3>
          <p className="text-violet-200 text-sm leading-relaxed">{game.objective}</p>
        </div>

        <CollapsibleSection title="Dice Probabilities">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {game.diceRollProbabilities.map((p, i) => (
              <div key={i} className="bg-[#0d2a18]/60 rounded-lg p-2 text-center">
                <p className="text-xs text-[#d1fae5]/48 leading-snug">{p}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Sample Round">
          <p className="text-sm text-[#d1fae5]/48 mb-3 italic">{game.sampleRound.description}</p>
          <div className="mb-2 flex gap-3 text-sm text-[#d1fae5]/48">
            <span>Shooter: <strong className="text-[#d1fae5]/80">{game.sampleRound.shooter}</strong></span>
            <span>|</span>
            <span>Bet: <strong className="text-[#d1fae5]/80">{game.sampleRound.bet}</strong></span>
          </div>
          <div className="space-y-2">
            {game.sampleRound.rolls.map((r) => (
              <div key={r.rollNumber} className="bg-[#0d2a18]/60 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#d1fae5]/48">Roll #{r.rollNumber} — {r.phase}</span>
                  <span className="font-mono text-sm font-bold text-[#d1fae5]">{r.dice[0]}+{r.dice[1]}={r.total}</span>
                </div>
                <p className="text-xs text-[#d1fae5]/62">{r.result}</p>
                <p className="text-xs text-[#d1fae5]/38 mt-0.5">{r.betStatus}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Etiquette & Terminology" defaultOpen={false}>
          <div className="space-y-1.5">
            {game.etiquette.slice(0, 4).map((e, i) => (
              <p key={i} className="text-sm text-[#d1fae5]/62 flex gap-2">
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
        <p className="text-[#d1fae5]/48 text-sm">Getting a craps game started:</p>
        <StepList steps={game.setup} />
      </div>
    );
  }

  if (activeTab === 'rules') {
    return (
      <div className="space-y-4">
        <p className="text-[#d1fae5]/48 text-sm">How dice outcomes determine wins and losses:</p>
        <div className="space-y-4">
          {game.gameplay.map((phase, i) => (
            <div key={i} className="border border-[#39FF14]/10 rounded-xl overflow-hidden">
              <div className="bg-violet-950/30 px-4 py-2.5 border-b border-violet-500/20">
                <h4 className="font-semibold text-violet-300">{phase.phase}</h4>
              </div>
              <div className="p-4">
                <p className="text-sm text-[#d1fae5]/62 mb-3">{phase.description}</p>
                {phase.outcomes && (
                  <div className="space-y-2">
                    {phase.outcomes.map((o, j) => (
                      <div key={j} className="flex gap-3 items-start bg-[#0d2a18]/60 rounded-lg p-3">
                        <span className="text-xs font-bold bg-violet-950/30 text-violet-300 border border-violet-500/20 px-2 py-0.5 rounded shrink-0 whitespace-nowrap">{o.roll}</span>
                        <p className="text-xs text-[#d1fae5]/62">{o.result}</p>
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
              <li key={i} className="text-sm text-[#d1fae5]/62 flex gap-2">
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
          <h3 className="font-semibold text-[#d1fae5]/80 mb-3">Core Bets — Start Here</h3>
          <div className="space-y-3">
            {game.basicBets.map((bet) => (
              <div key={bet.name} className="border border-[#39FF14]/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                  <h4 className="font-bold text-[#d1fae5]">{bet.name}</h4>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 font-medium">{bet.payout}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bet.houseEdge === '0%' ? 'bg-emerald-950/30 border border-emerald-500/20 text-emerald-300' : 'bg-[#0d2a18]/80 border border-[#39FF14]/10 text-[#d1fae5]/62'}`}>
                      HE: {bet.houseEdge}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-[#d1fae5]/62 mb-1">{bet.description}</p>
                {bet.strategy && <p className="text-xs text-blue-300 bg-blue-950/30 rounded px-2 py-1">{bet.strategy}</p>}
                {bet.note && <p className="text-xs text-[#d1fae5]/38 mt-1">{bet.note}</p>}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-[#d1fae5]/80 mb-3">Advanced Bets — Know the Odds</h3>
          <div className="space-y-3">
            {game.advancedBets.map((bet) => (
              <div key={bet.name} className="border border-[#39FF14]/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                  <h4 className="font-bold text-[#d1fae5]">{bet.name}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-950/25 border border-red-500/20 text-red-300 font-medium">
                    HE: {bet.houseEdge}
                  </span>
                </div>
                <p className="text-sm text-[#d1fae5]/62 mb-1">{bet.description}</p>
                <p className="text-xs text-[#d1fae5]/38">Pays: {bet.payout}</p>
                {bet.strategy && <p className="text-xs text-red-300 bg-red-950/25 rounded px-2 py-1 mt-1">{bet.strategy}</p>}
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

  return null;
}

function FlipCupContent({ game, activeTab }: { game: FlipCupGame; activeTab: TabId }) {
  if (activeTab === 'overview') {
    return (
      <div className="space-y-4">
        <div className="bg-red-950/25 border border-red-500/20 rounded-xl px-4 py-3 flex items-start gap-2.5">
          <span className="text-red-500 text-lg shrink-0">⚠️</span>
          <p className="text-red-300 text-sm font-medium">{game.ageWarning}</p>
        </div>
        <div className="bg-sky-950/30 rounded-xl p-4 border border-sky-500/20">
          <h3 className="font-semibold text-sky-300 mb-2 flex items-center gap-2">
            <Trophy size={16} /> Objective
          </h3>
          <p className="text-sky-200 text-sm leading-relaxed">{game.objective}</p>
        </div>
        <div className="bg-[#0d2a18]/60 rounded-xl p-4 border border-[#39FF14]/10">
          <h4 className="font-semibold text-[#d1fae5]/80 mb-2 flex items-center gap-2">
            <Package size={16} /> Equipment
          </h4>
          <p className="text-[#d1fae5]/62 text-sm">{game.equipment}</p>
        </div>
      </div>
    );
  }

  if (activeTab === 'setup') {
    return (
      <div className="space-y-4">
        <p className="text-[#d1fae5]/48 text-sm">Set up Flip Cup in 4 steps:</p>
        <StepList steps={game.setup} />
      </div>
    );
  }

  if (activeTab === 'rules') {
    return (
      <div className="space-y-4">
        <p className="text-[#d1fae5]/48 text-sm">How a round of Flip Cup plays out:</p>
        <StepList steps={game.gameplay} />
        <CollapsibleSection title="Full Rules" defaultOpen={false}>
          <ul className="space-y-1.5">
            {game.rules.map((r, i) => (
              <li key={i} className="text-sm text-[#d1fae5]/62 flex gap-2">
                <span className="shrink-0 text-sky-500">›</span>
                {r}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      </div>
    );
  }

  if (activeTab === 'scoring') {
    return <StrategyTips tips={game.strategyTips} />;
  }

  if (activeTab === 'variations') {
    return <VariationCards variations={game.variations} />;
  }

  return null;
}

function AssholeContent({ game, activeTab }: { game: AssholeGame; activeTab: TabId }) {
  if (activeTab === 'overview') {
    return (
      <div className="space-y-4">
        <div className="bg-purple-950/30 rounded-xl p-4 border border-purple-500/20">
          <h3 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
            <Trophy size={16} /> Objective
          </h3>
          <p className="text-purple-200 text-sm leading-relaxed">{game.objective}</p>
        </div>
        <CollapsibleSection title="Card Ranking">
          <p className="text-sm text-[#d1fae5]/62">{game.cardRanking}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'].map((r, i, arr) => (
              <span key={r} className={`text-xs px-2 py-1 rounded font-mono font-bold border ${i === arr.length - 1 ? 'bg-purple-950/30 text-purple-300 border-purple-500/40' : 'bg-[#0d2a18]/60 text-[#d1fae5]/62 border-[#39FF14]/10'}`}>
                {r}
              </span>
            ))}
          </div>
          <p className="text-xs text-purple-400 mt-2">↑ Ace is the highest card</p>
        </CollapsibleSection>
      </div>
    );
  }

  if (activeTab === 'setup') {
    return (
      <div className="space-y-4">
        <p className="text-[#d1fae5]/48 text-sm">How to start an Asshole game:</p>
        <StepList steps={game.setup} />
      </div>
    );
  }

  if (activeTab === 'rules') {
    return (
      <div className="space-y-4">
        <p className="text-[#d1fae5]/48 text-sm">The flow of an Asshole round:</p>
        <StepList steps={game.gameplay} />
        <CollapsibleSection title="General Rules" defaultOpen={false}>
          <ul className="space-y-1.5">
            {game.rules.map((r, i) => (
              <li key={i} className="text-sm text-[#d1fae5]/62 flex gap-2">
                <span className="shrink-0 text-purple-500">›</span>
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
        <p className="text-[#d1fae5]/48 text-sm">Roles assigned after each round based on finishing order:</p>
        {game.roles.map((role) => (
          <div key={role.name} className="border border-[#39FF14]/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-[#d1fae5]">{role.name}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${role.name === 'President' ? 'bg-[#E1B300]/12 text-[#E1B300]' : role.name === 'Asshole' ? 'bg-red-950/25 border border-red-500/20 text-red-300' : 'bg-[#0d2a18]/80 border border-[#39FF14]/10 text-[#d1fae5]/62'}`}>
                {role.name === 'President' ? '🏆 Best' : role.name === 'Asshole' ? '😤 Worst' : '·'}
              </span>
            </div>
            <p className="text-sm text-[#d1fae5]/62 mb-1">{role.description}</p>
            <p className="text-xs text-blue-300 bg-blue-950/30 rounded px-2 py-1">{role.perks}</p>
          </div>
        ))}
        <StrategyTips tips={game.strategyTips} />
      </div>
    );
  }

  if (activeTab === 'variations') {
    return <VariationCards variations={game.variations} />;
  }

  return null;
}

function TwentyEightContent({ game, activeTab }: { game: TwentyEightGame; activeTab: TabId }) {
  if (activeTab === 'overview') {
    return (
      <div className="space-y-4">
        <div className="bg-teal-950/30 rounded-xl p-4 border border-teal-500/20">
          <h3 className="font-semibold text-teal-300 mb-2 flex items-center gap-2">
            <Trophy size={16} /> Objective
          </h3>
          <p className="text-teal-200 text-sm leading-relaxed">{game.objective}</p>
        </div>
        <CollapsibleSection title="Card Point Values">
          <div className="grid grid-cols-2 gap-2">
            {game.cardValues.map((cv) => (
              <div key={cv.rank} className={`rounded-lg p-2.5 flex items-center justify-between border ${cv.points > 0 ? 'bg-[#E1B300]/8 border-[#E1B300]/20' : 'bg-[#0d2a18]/60 border-[#39FF14]/10'}`}>
                <span className="font-semibold text-[#d1fae5]/80 text-sm">{cv.rank}</span>
                <span className={`text-sm font-extrabold ${cv.points > 0 ? 'text-[#E1B300]' : 'text-[#d1fae5]/55'}`}>
                  {cv.points > 0 ? `+${cv.points} pts` : '0 pts'}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#d1fae5]/38 mt-2 text-center">Total: 28 points in the deck</p>
        </CollapsibleSection>
      </div>
    );
  }

  if (activeTab === 'setup') {
    return (
      <div className="space-y-4">
        <p className="text-[#d1fae5]/48 text-sm">Setting up a game of 28:</p>
        <StepList steps={game.setup} />
      </div>
    );
  }

  if (activeTab === 'rules') {
    return (
      <div className="space-y-4">
        <p className="text-[#d1fae5]/48 text-sm">How a round of 28 unfolds:</p>
        <StepList steps={game.gameplay} />
        <CollapsibleSection title="Bidding Rules" defaultOpen={false}>
          <ul className="space-y-1.5">
            {game.bidding.map((b, i) => (
              <li key={i} className="text-sm text-[#d1fae5]/62 flex gap-2">
                <span className="shrink-0 text-teal-500">›</span>
                {b}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
        <CollapsibleSection title="General Rules" defaultOpen={false}>
          <ul className="space-y-1.5">
            {game.rules.map((r, i) => (
              <li key={i} className="text-sm text-[#d1fae5]/62 flex gap-2">
                <span className="shrink-0 text-teal-500">›</span>
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
        <p className="text-[#d1fae5]/48 text-sm">Card points — only these 4 ranks score:</p>
        <div className="grid grid-cols-2 gap-3">
          {game.cardValues.filter(cv => cv.points > 0).map((cv) => (
            <div key={cv.rank} className="bg-[#E1B300]/8 border border-amber-200 rounded-xl p-3 text-center">
              <p className="text-xl font-extrabold text-[#E1B300]">{cv.points}</p>
              <p className="text-sm font-semibold text-[#d1fae5]/80">{cv.rank}</p>
              <p className="text-xs text-[#d1fae5]/38">points</p>
            </div>
          ))}
        </div>
        <div className="bg-teal-950/30 border border-teal-500/20 rounded-xl p-3 text-center">
          <p className="text-sm font-semibold text-teal-300">Total in deck: <span className="font-extrabold text-teal-200 text-lg">28</span> points</p>
          <p className="text-xs text-teal-400 mt-1">Bid between 15–28 to win the right to set trump</p>
        </div>
        <StrategyTips tips={game.strategyTips} />
      </div>
    );
  }

  if (activeTab === 'variations') {
    return <VariationCards variations={game.variations} />;
  }

  return null;
}

function KaaliTeeriContent({ game, activeTab }: { game: KaaliTeeriGame; activeTab: TabId }) {
  if (activeTab === 'overview') {
    return (
      <div className="space-y-4">
        <div className="bg-stone-900 rounded-xl p-4 border border-stone-700">
          <div className="flex items-start gap-3">
            <span className="text-3xl font-black text-amber-300 shrink-0">3♠</span>
            <div>
              <h3 className="font-extrabold text-white text-base mb-1">The Kaali Teeri Rule</h3>
              <p className="text-[#d1fae5]/55 text-sm leading-relaxed">{game.specialCards[0]}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-950/30 rounded-xl p-4 border border-slate-500/20">
          <h3 className="font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <Trophy size={16} /> Objective
          </h3>
          <p className="text-slate-200 text-sm leading-relaxed">{game.objective}</p>
        </div>
        <CollapsibleSection title="Special Cards">
          <div className="space-y-2">
            {game.specialCards.map((sc, i) => (
              <div key={i} className={`rounded-lg p-3 border ${i === 0 ? 'bg-stone-900 border-stone-700' : 'bg-[#0d2a18]/60 border-[#39FF14]/10'}`}>
                <p className={`text-sm leading-relaxed ${i === 0 ? 'text-stone-200' : 'text-[#d1fae5]/62'}`}>{sc}</p>
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
        <p className="text-[#d1fae5]/48 text-sm">Setting up Kaali Teeri:</p>
        <StepList steps={game.setup} />
      </div>
    );
  }

  if (activeTab === 'rules') {
    return (
      <div className="space-y-4">
        <p className="text-[#d1fae5]/48 text-sm">How a round of Kaali Teeri is played:</p>
        <StepList steps={game.gameplay} />
        <CollapsibleSection title="Bidding Rules" defaultOpen={false}>
          <ul className="space-y-1.5">
            {game.bidding.map((b, i) => (
              <li key={i} className="text-sm text-[#d1fae5]/62 flex gap-2">
                <span className="shrink-0 text-[#d1fae5]/48">›</span>
                {b}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
        <CollapsibleSection title="General Rules" defaultOpen={false}>
          <ul className="space-y-1.5">
            {game.rules.map((r, i) => (
              <li key={i} className="text-sm text-[#d1fae5]/62 flex gap-2">
                <span className="shrink-0 text-[#d1fae5]/48">›</span>
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
        <p className="text-[#d1fae5]/48 text-sm">Cards that change the game:</p>
        {game.specialCards.map((sc, i) => (
          <div key={i} className={`rounded-xl p-4 border ${i === 0 ? 'bg-stone-900 border-stone-700' : 'bg-[#0d2a18]/60 border-[#39FF14]/10'}`}>
            <p className={`text-sm leading-relaxed ${i === 0 ? 'text-stone-200' : 'text-[#d1fae5]/62'}`}>{sc}</p>
          </div>
        ))}
        <div className="bg-slate-950/30 border border-slate-500/20 rounded-xl p-3 text-center">
          <p className="text-sm font-semibold text-slate-300">Each trick = <span className="font-extrabold text-lg">10</span> points</p>
          <p className="text-xs text-slate-400 mt-1">First team to 250 points wins the match</p>
        </div>
        <StrategyTips tips={game.strategyTips} />
      </div>
    );
  }

  if (activeTab === 'variations') {
    return <VariationCards variations={game.variations} />;
  }

  return null;
}

export default function GameDetailPage() {
  const { id } = useParams<{ id: string }>();
  const game = games.find((g) => g.id === id);
  const [activeTab, setActiveTab] = useState<TabId>(SIMULATED_GAMES.has(id ?? '') ? 'simulate' : 'overview');

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🎲</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#d1fae5' }}>Game not found</h2>
          <Link to="/" className="font-medium" style={{ color: '#E1B300' }}>
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
    'flip-cup': 'from-sky-500 via-blue-500 to-blue-600',
    'asshole': 'from-purple-600 via-pink-600 to-pink-700',
    'twenty-eight': 'from-teal-500 via-cyan-600 to-cyan-700',
    'kaali-teeri': 'from-stone-700 via-stone-800 to-stone-900',
  };
  const gameHeaderIcons: Record<string, React.ReactNode> = {
    'yahtzee': <Dices size={32} className="text-white" />,
    'texas-holdem': <span className="text-4xl text-white">♠</span>,
    'ride-the-bus': <span className="text-3xl">🚌</span>,
    'teen-patti': <span className="text-3xl">🃏</span>,
    'blackjack': <span className="text-3xl font-black text-white">21</span>,
    'craps': <Dices size={32} className="text-white" />,
    'flip-cup': <span className="text-3xl">🍺</span>,
    'asshole': <span className="text-3xl">♠</span>,
    'twenty-eight': <span className="text-3xl font-black text-white">28</span>,
    'kaali-teeri': <span className="text-2xl font-black text-amber-300">3♠</span>,
  };

  const headerGradient = gameHeaderGradients[game.id] ?? (game.type === 'card' ? 'from-rose-500 to-pink-600' : 'from-amber-500 to-orange-600');
  const headerIcon = gameHeaderIcons[game.id] ?? (game.type === 'card' ? <span className="text-4xl text-white">♠</span> : <Dices size={32} className="text-white" />);
  // activePill removed — tabs now use inline neon gold styles

  const handleViewRules = () => setActiveTab('rules');

  const allTabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'simulate', label: 'Try It ✦', icon: <Play size={14} /> },
    { id: 'overview', label: 'Overview', icon: <BookOpen size={14} /> },
    { id: 'setup', label: 'Setup', icon: <Package size={14} /> },
    { id: 'rules', label: 'Rules', icon: <BookOpen size={14} /> },
    { id: 'scoring', label: ({ 'texas-holdem': 'Hand Rankings', 'teen-patti': 'Hand Rankings', 'ride-the-bus': 'Scoring & Tips', 'blackjack': 'Basic Strategy', 'craps': 'Bets', 'flip-cup': 'Tips', 'asshole': 'Roles', 'twenty-eight': 'Card Points', 'kaali-teeri': 'Special Cards' } as Record<string, string>)[game.id] ?? 'Scoring', icon: <Trophy size={14} /> },
    { id: 'variations', label: 'Variations', icon: <Shuffle size={14} /> },
  ];
  const tabs = SIMULATED_GAMES.has(game.id) ? allTabs : allTabs.filter(t => t.id !== 'simulate');

  return (
    <div className="min-h-screen">
      {/* Header — colorful gradient per game */}
      <div className={`bg-gradient-to-br ${headerGradient} relative overflow-hidden`}>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(57, 255, 20, 0.12) 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.6 }} />
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

      {/* Tabs — cyber pill style */}
      <div
        className="sticky top-0 z-10 backdrop-blur border-b"
        style={{
          background: 'rgba(5, 16, 10, 0.96)',
          borderColor: 'rgba(57, 255, 20, 0.12)',
          boxShadow: '0 2px 20px rgba(57, 255, 20, 0.06)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 relative">
          <div className="flex overflow-x-auto gap-1 py-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold whitespace-nowrap rounded-xl transition-all shrink-0"
                style={
                  activeTab === tab.id
                    ? {
                        background: 'rgba(225, 179, 0, 0.15)',
                        color: '#E1B300',
                        border: '1px solid rgba(225, 179, 0, 0.35)',
                        textShadow: '0 0 8px rgba(225, 179, 0, 0.5)',
                      }
                    : {
                        color: 'rgba(209, 250, 229, 0.4)',
                        border: '1px solid transparent',
                      }
                }
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          {/* Fade-right hint that more tabs exist on mobile */}
          <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none sm:hidden" style={{ background: 'linear-gradient(to right, transparent, rgba(5, 16, 10, 0.96))' }} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 fade-in">
        {/* Simulate tab: rendered centrally via registry (lazy-loaded per game) */}
        {activeTab === 'simulate' && simulationRegistry[game.id] && (() => {
          const entry = simulationRegistry[game.id];
          const SimComponent = entry.component;
          return (
            <Suspense fallback={<div className="text-center py-12" style={{ color: 'rgba(209,250,229,0.5)' }}>Loading simulation…</div>}>
              {entry.footnote ? (
                <div className="space-y-3">
                  <SimComponent onViewRules={handleViewRules} />
                  <p className="text-xs text-[#d1fae5]/38 leading-relaxed px-1">
                    <strong className="text-[#d1fae5]/48">Simulation assumes:</strong> {entry.footnote}
                  </p>
                </div>
              ) : (
                <SimComponent onViewRules={handleViewRules} />
              )}
            </Suspense>
          );
        })()}
        {/* Rules / overview tabs: routed per-game content component */}
        {activeTab !== 'simulate' && game.id === 'yahtzee' && (
          <YahtzeeContent game={game as YahtzeeGame} activeTab={activeTab} />
        )}
        {activeTab !== 'simulate' && game.id === 'texas-holdem' && (
          <PokerContent game={game as PokerGame} activeTab={activeTab} />
        )}
        {activeTab !== 'simulate' && game.id === 'ride-the-bus' && (
          <RideBusContent game={game as RideBusGame} activeTab={activeTab} />
        )}
        {activeTab !== 'simulate' && game.id === 'teen-patti' && (
          <TeenPattiContent game={game as TeenPattiGame} activeTab={activeTab} />
        )}
        {activeTab !== 'simulate' && game.id === 'blackjack' && (
          <BlackjackContent game={game as BlackjackGame} activeTab={activeTab} />
        )}
        {activeTab !== 'simulate' && game.id === 'craps' && (
          <CrapsContent game={game as CrapsGame} activeTab={activeTab} />
        )}
        {activeTab !== 'simulate' && game.id === 'flip-cup' && (
          <FlipCupContent game={game as FlipCupGame} activeTab={activeTab} />
        )}
        {activeTab !== 'simulate' && game.id === 'asshole' && (
          <AssholeContent game={game as AssholeGame} activeTab={activeTab} />
        )}
        {activeTab !== 'simulate' && game.id === 'twenty-eight' && (
          <TwentyEightContent game={game as TwentyEightGame} activeTab={activeTab} />
        )}
        {activeTab !== 'simulate' && game.id === 'kaali-teeri' && (
          <KaaliTeeriContent game={game as KaaliTeeriGame} activeTab={activeTab} />
        )}
      </div>
    </div>
  );
}
