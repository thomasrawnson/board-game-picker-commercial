import {
  useState,
} from "react"

import {
  getPickerMatches,
  type PickerMatch,
} from "../../api/client"

import {
  PlayerStep,
} from "./PlayerStep"

import TimeStep
  from "./TimeStep"

import PreferenceStep
  from "./PreferenceStep"

import PickerResult
  from "./PickerResult"


type Step =
  | "players"
  | "time"
  | "preferences"
  | "reveal"

type Props = {
  onViewCollection: () => void
}


function PickerView({
  onViewCollection,
}: Props) {
  const [step, setStep] =
    useState<Step>("players")

  const [players, setPlayers] =
    useState<number | null>(
      null,
    )

  const [
    maxPlayTime,
    setMaxPlayTime,
  ] =
    useState<number | null>(
      null,
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

  const [matches, setMatches] =
    useState<PickerMatch[]>([])

  const [
    matchIndex,
    setMatchIndex,
  ] =
    useState(0)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState("")

  const match =
    matches[matchIndex]


  function toggleCategory(
    category: string,
  ) {
    setPreferredCategories(
      (current) =>
        current.includes(
          category,
        )
          ? current.filter(
              (item) =>
                item !==
                category,
            )
          : [
              ...current,
              category,
            ],
    )
  }


  function toggleMechanic(
    mechanic: string,
  ) {
    setPreferredMechanics(
      (current) =>
        current.includes(
          mechanic,
        )
          ? current.filter(
              (item) =>
                item !==
                mechanic,
            )
          : [
              ...current,
              mechanic,
            ],
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

          maxPlayTime:
            maxPlayTime === 0
              ? undefined
              : maxPlayTime ??
                undefined,

          preferredCategories,
          preferredMechanics,
        })

      if (
        results.length === 0
      ) {
        setError(
          "No games matched those choices. Try allowing more time.",
        )

        return
      }

      setMatches(results)
      setMatchIndex(0)
      setStep("reveal")
    } catch (err) {
      console.error(err)

      setError(
        "Couldn't reach the Board Game Picker API.",
      )
    } finally {
      setLoading(false)
    }
  }


  function tryAnother() {
    if (
      matches.length === 0
    ) {
      return
    }

    setMatchIndex(
      (current) =>
        (current + 1) %
        matches.length,
    )
  }


  function startOver() {
    setStep("players")
    setPlayers(null)
    setMaxPlayTime(null)

    setPreferredCategories(
      [],
    )

    setPreferredMechanics(
      [],
    )

    setMatches([])
    setMatchIndex(0)
    setError("")
  }


  return (
    <>
      <div className="progress-dots">
        <span
          className={
            step === "players"
              ? "dot active"
              : "dot"
          }
        />

        <span
          className={
            step === "time"
              ? "dot active"
              : "dot"
          }
        />

        <span
          className={
            step ===
            "preferences"
              ? "dot active"
              : "dot"
          }
        />

        <span
          className={
            step === "reveal"
              ? "dot active"
              : "dot"
          }
        />
      </div>

      {step === "players" && (
        <PlayerStep
          players={players}
          onSelect={setPlayers}
          onContinue={() =>
            setStep("time")
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
              "preferences",
            )
          }
          onBack={() =>
            setStep("players")
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
          error={error}
          loading={loading}
          onToggleCategory={
            toggleCategory
          }
          onToggleMechanic={
            toggleMechanic
          }
          onReveal={
            revealGame
          }
          onBack={() =>
            setStep("time")
          }
        />
      )}

      {step === "reveal" &&
        match && (
        <PickerResult
          match={match}
          matchIndex={
            matchIndex
          }
          totalMatches={
            matches.length
          }
          onTryAnother={
            tryAnother
          }
          onViewGame={
            onViewCollection
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