import Map from "@/components/ui/MapFiles/Map";
import "@/routes/Root.css";
import { motion } from "framer-motion";

export default function RootPage() {
  return (
    <>
      <Map />
      <motion.div
        initial={{ left: "-100px", opacity: 0, filter: "blur(10px)" }}
        animate={{ left: 0, opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="fixed left-2 bottom-2 z-[999999999999] rounded-lg backdrop-blur-lg"
      >
        <motion.img
          src="/logo.png"
          alt="Branding"
          width={200}
          className="mt-2"
        />
      </motion.div>
    </>
  );
}
