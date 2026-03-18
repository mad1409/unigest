import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { INITIAL_DATA } from "../data/initialData";

const DATA_VERSION = "1.4";
const STORAGE_KEY  = "unigest_data";
const VERSION_KEY  = "unigest_version";

export function useData() {
  // Reset immédiat si version différente — avant tout
  const storedVersion = localStorage.getItem(VERSION_KEY);
  if (storedVersion !== DATA_VERSION) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(VERSION_KEY, DATA_VERSION);
    window.location.reload();
  }

  const [data, setData] = useLocalStorage(STORAGE_KEY, INITIAL_DATA);

  const resetData = useCallback(() => {
    if (confirm("Remettre toutes les donnees initiales ? Action irreversible.")) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(VERSION_KEY);
      window.location.reload();
    }
  }, []);

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "unigest_backup_" + new Date().toISOString().slice(0,10) + ".json";
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const importData = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.parametres || !parsed.etudiants) {
          alert("Fichier invalide."); return;
        }
        setData(parsed);
        alert("Donnees importees avec succes !");
      } catch {
        alert("Fichier JSON invalide.");
      }
    };
    reader.readAsText(file);
  }, [setData]);

  return { data, setData, resetData, exportData, importData };
}
