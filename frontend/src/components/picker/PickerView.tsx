import { useEffect, useState } from "react";

import {
  getPickerMatches,
  getPickerOptions,
  recordPickerEvent,
  type PickerMatch,
  type PickerMode,
  type PickerNoMatchGuidance,
  type PickerPlayStyle,
} from "../../api/client";

import { PlayerStep } from "./PlayerStep";

import PlayerSelectionStep from "./PlayerSelectionStep";

import TimeStep from "./TimeStep";

import PreferenceStep from "./PreferenceStep";

import ThemeStep from "./ThemeStep";

import PlayStyleStep from "./PlayStyleStep";

import PickerResult from "./PickerResult";

import PickerNoMatch from "./PickerNoMatch";

type Step =
  | "players"
  | "player_selection"
  | "time"
  | "preferences"
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

  const [maxComplexity, setMaxComplexity] = useState<number | null>(null);

  const [youngestPlayerAge, setYoungestPlayerAge] = useState<number | null>(
    null,
  );

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

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      try {
        const options = await getPickerOptions();

        if (cancelled) {
          return;
        }

        setCategoryOptions(options.categories);

        setMechanicOptions(options.mechanics);
      } catch (err) {
        console.error("Couldn't load picker options", err);
      }
    }

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

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
    nextMaxComplexity = maxComplexity,
    nextYoungestPlayerAge = youngestPlayerAge,
    nextPlayStyle = playStyle,
  ) {
    if (players === null) {
      return;
    }

    setLoading(true);

    setPickerSessionId(null);

    setError("");

    try {
      const response = await getPickerMatches({
        players,

        playerIds: selectedPlayerIds,

        maxPlayTime:
          nextMaxPlayTime === 0 ? undefined : (nextMaxPlayTime ?? undefined),

        maxComplexity: nextMaxComplexity ?? undefined,

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

      setError("Couldn't reach the Board Game Picker API.");
    } finally {
      setLoading(false);
    }
  }

  function revealGame() {
    void loadMatches();
  }

  function relaxTime() {
    setMaxPlayTime(null);

    void loadMatches(null, maxComplexity);
  }

  function relaxComplexity() {
    setMaxComplexity(null);

    setYoungestPlayerAge(null);

    setPlayStyle("any");

    void loadMatches(maxPlayTime, null, null, "any");
  }

  function relaxTimeAndComplexity() {
    setMaxPlayTime(null);

    setMaxComplexity(null);

    setYoungestPlayerAge(null);

    setPlayStyle("any");

    void loadMatches(null, null, null, "any");
  }

  function tryAnother() {
    if (!hasMoreMatches) {
      return;
    }

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

    setMaxComplexity(null);

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
    if (!match) {
      return;
    }

    void recordPickerEvent(
      pickerSessionId,
      "view_game",
      match.game.bgg_id,
      matchIndex,
    );

    onViewGame(match.game.bgg_id);
  }

  const progressStep =
    step === "players" || step === "player_selection"
      ? 0
      : step === "time"
        ? 1
        : step === "preferences" || step === "theme" || step === "play_style"
          ? 2
          : 3;

  return (
    <>
      {step !== "reveal" && (
        <div
          className="progress-dots"
          aria-label={`Picker step ${progressStep + 1} of 4`}
        >
          {[0, 1, 2, 3].map((index) => (
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
          maxComplexity={maxComplexity}
          onSelectCount={chooseGroupSize}
          onComplexityChange={setMaxComplexity}
          onChoosePlayers={() => setStep("player_selection")}
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
          onSelect={setMaxPlayTime}
          onContinue={() => setStep("preferences")}
          onBack={() => setStep("players")}
        />
      )}

      {step === "preferences" && (
        <PreferenceStep
          preferredCategories={preferredCategories}
          preferredMechanics={preferredMechanics}
          youngestPlayerAge={youngestPlayerAge}
          playStyle={playStyle}
          mode={mode}
          error={error}
          loading={loading}
          onYoungestPlayerAgeChange={setYoungestPlayerAge}
          onPlayStyleChange={setPlayStyle}
          onModeChange={setMode}
          onOpenTheme={() => setStep("theme")}
          onOpenPlayStyle={() => setStep("play_style")}
          onReveal={revealGame}
          onBack={() => setStep("time")}
        />
      )}

      {step === "theme" && (
        <ThemeStep
          options={categoryOptions}
          selected={preferredCategories}
          onToggle={toggleCategory}
          onClear={() => setPreferredCategories([])}
          onDone={() => setStep("preferences")}
          onBack={() => setStep("preferences")}
        />
      )}

      {step === "play_style" && (
        <PlayStyleStep
          options={mechanicOptions}
          selected={preferredMechanics}
          onToggle={toggleMechanic}
          onClear={() => setPreferredMechanics([])}
          onDone={() => setStep("preferences")}
          onBack={() => setStep("preferences")}
        />
      )}

      {step === "no_match" && players !== null && (
        <PickerNoMatch
          playerCount={players}
          guidance={noMatchGuidance}
          hasTimeLimit={maxPlayTime !== null && maxPlayTime !== 0}
          hasComplexityLimit={maxComplexity !== null}
          loading={loading}
          error={error}
          onRelaxTime={relaxTime}
          onRelaxComplexity={relaxComplexity}
          onRelaxBoth={relaxTimeAndComplexity}
          onAdjustChoices={() => setStep("preferences")}
          onStartOver={startOver}
        />
      )}

      {step === "reveal" && match && (
        <div className="picker-result-stage">
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
    </>
  );
}

export default PickerView;
