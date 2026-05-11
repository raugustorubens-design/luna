import { motion } from "framer-motion"
import orbImg from "../Luna-orb.png"

type LunaState = "idle" | "thinking" | "responding" | "alert"

export default function LunaOrb({ state = "idle" }: { state?: LunaState }) {
  const stateAnimation = {
    idle: {
      scale: 1,
      filter: "brightness(1)",
    },
    thinking: {
      scale: [1, 1.05, 1],
      filter: "brightness(1.2)",
      transition: { repeat: Infinity, duration: 1.5 },
    },
    responding: {
      scale: [1, 1.15, 1],
      filter: "brightness(1.5)",
      transition: { repeat: Infinity, duration: 0.8 },
    },
    alert: {
      scale: [1, 1.25, 1],
      filter: "brightness(2) hue-rotate(-30deg)",
      transition: { repeat: Infinity, duration: 0.4 },
    },
  }

  return (
    <motion.img
      src={orbImg}
      alt="Luna Orb"
      className="w-40 h-40 object-contain select-none"

      animate={{ rotate: 360 }}
      transition={{
        repeat: Infinity,
        duration: 20,
        ease: "linear",
      }}

      variants={stateAnimation}
      initial="idle"
      animate={state}
    />
  )
}