import {
  useState,
} from "react"

import {
  getPickerMatches,
  type PickerMatch,
  type PickerMode,
} from "../../api/client"

import {
  PlayerStep,
} from "./PlayerStep"

import PlayerSelectionStep
  from "./PlayerSelectionStep"

import TimeStep
  from "./TimeStep"

import PreferenceStep
  from "./PreferenceStep"

import ThemeStep
  from "./ThemeStep"

import PlayStyleStep
  from "./PlayStyleStep"

import PickerResult
  from "./PickerResult"


type Step =
  | "players"
  | "player_selection"
  | "time"
  | "preferences"
  | "theme"
  | "play_style"
  | "reveal"


type Props = {
  onViewGame: (
    bggId: number,
  ) => void
}


function PickerView({
  onViewGame,
}: Props) {
  const [step, setStep] =
    useState<Step>("players")

  const [
    selectedPlayerIds,
    setSelectedPlayerIds,
  ] = useState<number[]>([])

  const [players, setPlayers] =
    useState<number | null>(
      null
    )

  const [
    maxPlayTime,
    setMaxPlayTime,
  ] =
    useState<number | null>(
      null
    )

  const [
    maxComplexity,
    setMaxComplexity,
  ] =
    useState<number | null>(
      null
    )

  const [
    preferredCategories,
    setPreferredCategories,
  ] =
    useState<string[]>([])

  const [
    preferredMechanics,
    setPreferredMechanics,
  ] =
    useState<string[]>([])

  const [mode, setMode] =
    useState<PickerMode>(
      "best_match"
    )

  const [matches, setMatches] =
    useState<PickerMatch[]>([])

  const [
    matchIndex,
    setMatchIndex,
  ] = useState(0)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState("")


  const match =
    matches[matchIndex]

  const hasMoreMatches =
    matchIndex <
    matches.length - 1


  function toggleCategory(
    category: string,
  ) {
    setPreferredCategories(
      (current) =>
        current.includes(
          category
        )
          ? current.filter(
              (item) =>
                item !== category
            )
          : [
              ...current,
              category,
            ]
    )
  }


  function toggleMechanic(
    mechanic: string,
  ) {
    setPreferredMechanics(
      (current) =>
        current.includes(
          mechanic
        )
          ? current.filter(
              (item) =>
                item !== mechanic
            )
          : [
              ...current,
              mechanic,
            ]
    )
  }


  function handlePlayerSelection(
    playerIds: number[],
  ) {
    setSelectedPlayerIds(
      playerIds
    )

    setPlayers(
      playerIds.length > 0
        ? playerIds.length
        : null
    )
  }


  function chooseGroupSize(
    count: number | null,
  ) {
    setSelectedPlayerIds([])
    setPlayers(
      count
    )
  }


  async function revealGame() {
    if (players === null) {
      return
    }

    setLoading(true)
    setError("")

    try {
      const results =
        await getPickerMatches({
          players,
          playerIds:
            selectedPlayerIds,

          maxPlayTime:
            maxPlayTime === 0
              ? undefined
              : maxPlayTime ??
                undefined,

          maxComplexity:
            maxComplexity ??
            undefined,

          preferredCategories,
          preferredMechanics,
          mode,
        })

      if (
        results.length === 0
      ) {
        setError(
          "No games matched those choices. Try allowing more time or weight."
        )

        return
      }

      setMatches(
        results
      )

      setMatchIndex(
        0
      )

      setStep(
        "reveal"
      )
    } catch (err) {
      console.error(err)

      setError(
        "Couldn't reach the Board Game Picker API."
      )
    } finally {
      setLoading(false)
    }
  }


  function tryAnother() {
    if (!hasMoreMatches) {
      return
    }

    setMatchIndex(
      (current) =>
        current + 1
    )
  }


  function startOver() {
    setStep(
      "players"
    )

    setPlayers(
      null
    )

    setSelectedPlayerIds(
      []
    )

    setMaxPlayTime(
      null
    )

    setMaxComplexity(
      null
    )

    setPreferredCategories(
      []
    )

    setPreferredMechanics(
      []
    )

    setMode(
      "best_match"
    )

    setMatches(
      []
    )

    setMatchIndex(
      0
    )

    setError(
      ""
    )
  }


  const progressStep =
    step === "players"
    || step === "player_selection"
      ? 0
      : step === "time"
        ? 1
        : step === "preferences"
          || step === "theme"
          || step === "play_style"
          ? 2
          : 3


  return (
    <>
      <div
        className="progress-dots"
        aria-label={`Picker step ${
          progressStep + 1
        } of 4`}
      >
        {[0, 1, 2, 3].map(
          (index) => (
            <span
              key={index}
              className={
                progressStep ===
                index
                  ? "dot active"
                  : "dot"
              }
            />
          ),
        )}
      </div>


      {step === "players" && (
        <PlayerStep
          players={
            players
          }
          selectedPlayerIds={
            selectedPlayerIds
          }
          onSelectCount={
            chooseGroupSize
          }
          onChoosePlayers={() =>
            setStep(
              "player_selection"
            )
          }
          onContinue={() =>
            setStep(
              "time"
            )
          }
        />
      )}


      {step ===
        "player_selection" && (
        <PlayerSelectionStep
          selectedPlayerIds={
            selectedPlayerIds
          }
          onChange={
            handlePlayerSelection
          }
          onDone={() =>
            setStep(
              "players"
            )
          }
          onBack={() =>
            setStep(
              "players"
            )
          }
        />
      )}


      {step === "time" && (
        <TimeStep
          maxPlayTime={
            maxPlayTime
          }
          onSelect={
            setMaxPlayTime
          }
          onContinue={() =>
            setStep(
              "preferences"
            )
          }
          onBack={() =>
            setStep(
              "players"
            )
          }
        />
      )}


      {step ===
        "preferences" && (
        <PreferenceStep
          preferredCategories={
            preferredCategories
          }
          preferredMechanics={
            preferredMechanics
          }
          maxComplexity={
            maxComplexity
          }
          mode={
            mode
          }
          error={
            error
          }
          loading={
            loading
          }
          onComplexityChange={
            setMaxComplexity
          }
          onModeChange={
            setMode
          }
          onOpenTheme={() =>
            setStep(
              "theme"
            )
          }
          onOpenPlayStyle={() =>
            setStep(
              "play_style"
            )
          }
          onReveal={
            revealGame
          }
          onBack={() =>
            setStep(
              "time"
            )
          }
        />
      )}


      {step === "theme" && (
        <ThemeStep
          selected={
            preferredCategories
          }
          onToggle={
            toggleCategory
          }
          onClear={() =>
            setPreferredCategories(
              []
            )
          }
          onDone={() =>
            setStep(
              "preferences"
            )
          }
          onBack={() =>
            setStep(
              "preferences"
            )
          }
        />
      )}


      {step ===
        "play_style" && (
        <PlayStyleStep
          selected={
            preferredMechanics
          }
          onToggle={
            toggleMechanic
          }
          onClear={() =>
            setPreferredMechanics(
              []
            )
          }
          onDone={() =>
            setStep(
              "preferences"
            )
          }
          onBack={() =>
            setStep(
              "preferences"
            )
          }
        />
      )}


      {step === "reveal"
        && match && (
        <PickerResult
          match={
            match
          }
          matchIndex={
            matchIndex
          }
          totalMatches={
            matches.length
          }
          mode={
            mode
          }
          playerCount={
            players ?? 1
          }
          hasMoreMatches={
            hasMoreMatches
          }
          onTryAnother={
            tryAnother
          }
          onViewGame={() =>
            onViewGame(
              match.game.bgg_id
            )
          }
          onStartOver={
            startOver
          }
        />
      )}
    </>
  )
}


export default PickerView