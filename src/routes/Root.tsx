import Map from "@/components/ui/MapFiles/Map";
import "@/routes/Root.css";
import { motion } from "framer-motion";

export default function RootPage() {
  return (
    <>
      <Map />
      <motion.div
        initial={{ bottom: -16, opacity: 0, filter: "blur(10px)" }}
        animate={{ bottom: 8, opacity: 1, filter: "blur(0px)" }}
        transition={{ delay: 0.25, duration: 1, ease: "easeInOut" }}
        className="fixed left-2 bottom-2 z-[999999999999] rounded-lg backdrop-blur-lg px-4 py-2"
      >
        <motion.img
          src="/Festisite_google.webp"
          alt="Branding"
          width={200}
          className="mt-2"
        />
      </motion.div>
    </>
  );
}
