import RetryNotice from "../ui/RetryNotice";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getPickerMatches,
  getPickerOptions,
  recordPickerEvent,
  type PickerMatch,
  type PickerComplexityBand,
  type PickerMode,
  type PickerNoMatchGuidance,
  type PickerPlayStyle,
} from "../../api/client";

import { PlayerStep } from "./PlayerStep";
import PlayerSelectionStep from "./PlayerSelectionStep";
import TimeStep from "./TimeStep";
import ThemeStep from "./ThemeStep";
import PlayStyleStep from "./PlayStyleStep";
import PickerResult from "./PickerResult";
import PickerNoMatch from "./PickerNoMatch";

type Step =
  | "players"
  | "player_selection"
  | "time"
  | "theme"
  | "play_style"
  | "no_match"
  | "reveal";

type Props = {
  onViewGame: (bggId: number) => void;
};

function PickerView({ onViewGame }: Props) {
  const [step, setStep] = useState<Step>("players");
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [players, setPlayers] = useState<number | null>(null);
  const [maxPlayTime, setMaxPlayTime] = useState<number | null>(null);
  const [complexityBand, setComplexityBand] =
    useState<PickerComplexityBand | null>(null);
  const [youngestPlayerAge, setYoungestPlayerAge] =
    useState<number | null>(null);
  const [playStyle, setPlayStyle] = useState<PickerPlayStyle>("any");
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);
  const [preferredMechanics, setPreferredMechanics] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [mechanicOptions, setMechanicOptions] = useState<string[]>([]);
  const [mode, setMode] = useState<PickerMode>("best_match");
  const [matches, setMatches] = useState<PickerMatch[]>([]);
  const [matchIndex, setMatchIndex] = useState(0);
  const [noMatchGuidance, setNoMatchGuidance] =
    useState<PickerNoMatchGuidance | null>(null);
  const [pickerSessionId, setPickerSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const [optionsError, setOptionsError] = useState("");
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsAttempt, setOptionsAttempt] = useState(0);
  const swipeStartX = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      try {
        const options = await getPickerOptions();
        if (cancelled) return;
        setOptionsError("");
        setCategoryOptions(options.categories);
        setMechanicOptions(options.mechanics);
      } catch (err) {
        if (!cancelled) setOptionsError(err instanceof Error ? err.message : "Couldn't load themes and play styles.");
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    }

    void loadOptions();
    return () => {
      cancelled = true;
    };
  }, [optionsAttempt]);

  const match = matches[matchIndex];
  const hasMoreMatches = matchIndex < matches.length - 1;

  function toggleCategory(category: string) {
    setPreferredCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  }

  function toggleMechanic(mechanic: string) {
    setPreferredMechanics((current) =>
      current.includes(mechanic)
        ? current.filter((item) => item !== mechanic)
        : [...current, mechanic],
    );
  }

  function handlePlayerSelection(playerIds: number[]) {
    setSelectedPlayerIds(playerIds);
    setPlayers(playerIds.length > 0 ? playerIds.length : null);
  }

  function chooseGroupSize(count: number | null) {
    setSelectedPlayerIds([]);
    setPlayers(count);
  }

  async function loadMatches(
    nextMaxPlayTime = maxPlayTime,
    nextComplexityBand = complexityBand,
    nextYoungestPlayerAge = youngestPlayerAge,
    nextPlayStyle = playStyle,
  ) {
    if (players === null || pending.current) return;

    pending.current = true;
    setLoading(true);
    setError("");

    try {
      const response = await getPickerMatches({
        players,
        playerIds: selectedPlayerIds,
        maxPlayTime:
          nextMaxPlayTime === 0
            ? undefined
            : (nextMaxPlayTime ?? undefined),
        complexityBand: nextComplexityBand ?? undefined,
        youngestPlayerAge: nextYoungestPlayerAge ?? undefined,
        playStyle: nextPlayStyle,
        preferredCategories,
        preferredMechanics,
        mode,
      });

      setPickerSessionId(response.session_id);

      if (response.matches.length === 0) {
        setNoMatchGuidance(response.guidance);
        setStep("no_match");
        return;
      }

      setMatches(response.matches);
      setNoMatchGuidance(null);
      setMatchIndex(0);
      setStep("reveal");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Couldn't find a game. Please try again.");
    } finally {
      pending.current = false;
      setLoading(false);
    }
  }

  function revealGame() {
    void loadMatches();
  }

  function relaxTime() {
    setMaxPlayTime(null);
    void loadMatches(null, complexityBand);
  }

  function relaxComplexity() {
    setComplexityBand(null);
    setYoungestPlayerAge(null);
    setPlayStyle("any");
    void loadMatches(maxPlayTime, null, null, "any");
  }

  function relaxTimeAndComplexity() {
    setMaxPlayTime(null);
    setComplexityBand(null);
    setYoungestPlayerAge(null);
    setPlayStyle("any");
    void loadMatches(null, null, null, "any");
  }

  function tryAnother() {
    if (!hasMoreMatches) return;

    const nextIndex = matchIndex + 1;
    const nextMatch = matches[nextIndex];

    void recordPickerEvent(
      pickerSessionId,
      "try_another",
      nextMatch.game.bgg_id,
      nextIndex,
    );

    setMatchIndex(nextIndex);
  }

  function startOver() {
    void recordPickerEvent(
      pickerSessionId,
      "start_over",
      match?.game.bgg_id,
      match ? matchIndex : undefined,
    );

    setStep("players");
    setPlayers(null);
    setSelectedPlayerIds([]);
    setMaxPlayTime(null);
    setComplexityBand(null);
    setYoungestPlayerAge(null);
    setPlayStyle("any");
    setPreferredCategories([]);
    setPreferredMechanics([]);
    setMode("best_match");
    setMatches([]);
    setMatchIndex(0);
    setError("");
    setNoMatchGuidance(null);
    setPickerSessionId(null);
  }

  function viewGame() {
    if (!match) return;

    void recordPickerEvent(
      pickerSessionId,
      "view_game",
      match.game.bgg_id,
      matchIndex,
    );

    onViewGame(match.game.bgg_id);
  }

  const progressStep = step === "time" ? 1 : 0;

  return (
    <>
      {optionsError && <RetryNotice message={optionsError} busy={optionsLoading} onRetry={() => { setOptionsLoading(true); setOptionsAttempt(current => current + 1); }} />}
      {error && <RetryNotice message={error} busy={loading} onRetry={revealGame} />}
      <fieldset className="picker-request-fields" disabled={loading} aria-busy={loading}>
      {step !== "reveal" && step !== "no_match" && (
        <div
          className="progress-dots"
          aria-label={`Picker step ${progressStep + 1} of 2`}
        >
          {[0, 1].map((index) => (
            <span
              key={index}
              className={progressStep === index ? "dot active" : "dot"}
            />
          ))}
        </div>
      )}

      {step === "players" && (
        <PlayerStep
          players={players}
          selectedPlayerIds={selectedPlayerIds}
          complexityBand={complexityBand}
          preferredCategories={preferredCategories}
          preferredMechanics={preferredMechanics}
          youngestPlayerAge={youngestPlayerAge}
          playStyle={playStyle}
          mode={mode}
          onSelectCount={chooseGroupSize}
          onComplexityChange={setComplexityBand}
          onYoungestPlayerAgeChange={setYoungestPlayerAge}
          onPlayStyleChange={setPlayStyle}
          onModeChange={setMode}
          onChoosePlayers={() => setStep("player_selection")}
          onOpenTheme={() => setStep("theme")}
          onOpenMechanics={() => setStep("play_style")}
          onContinue={() => setStep("time")}
        />
      )}

      {step === "player_selection" && (
        <PlayerSelectionStep
          selectedPlayerIds={selectedPlayerIds}
          onChange={handlePlayerSelection}
          onDone={() => setStep("players")}
          onBack={() => setStep("players")}
        />
      )}

      {step === "time" && (
        <TimeStep
          maxPlayTime={maxPlayTime}
          loading={loading}
          error=""
          onSelect={setMaxPlayTime}
          onFindGame={revealGame}
          onBack={() => setStep("players")}
        />
      )}

      {step === "theme" && (
        <ThemeStep
          options={categoryOptions}
          selected={preferredCategories}
          onToggle={toggleCategory}
          onClear={() => setPreferredCategories([])}
          onDone={() => setStep("players")}
          onBack={() => setStep("players")}
        />
      )}

      {step === "play_style" && (
        <PlayStyleStep
          options={mechanicOptions}
          selected={preferredMechanics}
          onToggle={toggleMechanic}
          onClear={() => setPreferredMechanics([])}
          onDone={() => setStep("players")}
          onBack={() => setStep("players")}
        />
      )}

      {step === "no_match" && players !== null && (
        <PickerNoMatch
          playerCount={players}
          guidance={noMatchGuidance}
          hasTimeLimit={maxPlayTime !== null && maxPlayTime !== 0}
          hasComplexityLimit={complexityBand !== null}
          loading={loading}
          error=""
          onRelaxTime={relaxTime}
          onRelaxComplexity={relaxComplexity}
          onRelaxBoth={relaxTimeAndComplexity}
          onAdjustChoices={() => setStep("players")}
          onStartOver={startOver}
        />
      )}

      {step === "reveal" && match && (
        <div
          className="picker-result-stage"
          onTouchStart={(event) => {
            swipeStartX.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            if (swipeStartX.current === null) return;

            const endX =
              event.changedTouches[0]?.clientX ?? swipeStartX.current;
            const distance = endX - swipeStartX.current;
            swipeStartX.current = null;

            if (distance < -60 && hasMoreMatches) {
              tryAnother();
            }
          }}
        >
          <PickerResult
            match={match}
            matchIndex={matchIndex}
            totalMatches={matches.length}
            mode={mode}
            playerCount={players ?? 1}
            pickerSessionId={pickerSessionId}
            hasMoreMatches={hasMoreMatches}
            onTryAnother={tryAnother}
            onViewGame={viewGame}
            onStartOver={startOver}
          />
        </div>
      )}
      </fieldset>
    </>
  );
}

export default PickerView;
