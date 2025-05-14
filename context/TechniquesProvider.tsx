import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Technique } from "@/types/Technique";
import { logFlagEvent } from "@/utils/flagLogger";
const DOWNLOAD_URL = "https://karateapp.monster0506.dev/data/techniques.json";
const LOCAL_JSON_PATH = `${FileSystem.documentDirectory}techniques.json`;
const FLAG_KEY = "flagged-techniques";
const PLAYLIST_KEY = "playlists";

interface Playlist {
  name: string;
  ids: string[]; // Name fields used as ids
}

interface TechniquesContextProps {
  techniques: Technique[];
  loading: boolean;
  flagged: string[];
  playlists: Playlist[];
  currentList: Technique[]; // list the TechniqueList page should render
  setCurrentList: (list: Technique[]) => void;
  toggleFlag: (id: string) => void;
  addToPlaylist: (playlistName: string, id: string) => void;
  removeFromPlaylist: (playlistName: string, id: string) => void;
  toggleInPlaylist: (playlistName: string, id: string) => void;
  createPlaylist: (name: string) => void;
  renamePlaylist: (name: string, newName: string) => void;
  deletePlaylist: (name: string) => void;
  refreshData: () => Promise<void>;
}

const TechniquesContext = createContext<TechniquesContextProps | undefined>(
  undefined,
);

export const useTechniques = () => {
  const ctx = useContext(TechniquesContext);
  if (!ctx)
    throw new Error("useTechniques must be used inside TechniquesProvider");
  return ctx;
};

export const TechniquesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [loading, setLoading] = useState(true);
  const [flagged, setFlagged] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentList, setCurrentList] = useState<Technique[]>([]);

  // ---------- helpers ----------
  const loadLocalJson = async () => {
    const info = await FileSystem.getInfoAsync(LOCAL_JSON_PATH);
    if (!info.exists) return null;
    const content = await FileSystem.readAsStringAsync(LOCAL_JSON_PATH);
    return JSON.parse(content) as Technique[];
  };

  const downloadJson = async () => {
    await FileSystem.downloadAsync(DOWNLOAD_URL, LOCAL_JSON_PATH);
  };

  const loadFlags = async () => {
    const stored = await AsyncStorage.getItem(FLAG_KEY);
    if (stored) setFlagged(JSON.parse(stored));
  };

  const loadPlaylists = async () => {
    const stored = await AsyncStorage.getItem(PLAYLIST_KEY);
    if (stored) setPlaylists(JSON.parse(stored));
  };

  // ---------- startup ----------
  useEffect(() => {
    (async () => {
      try {
        let data = await loadLocalJson();
        if (!data) {
          await downloadJson();
          data = await loadLocalJson();
        }
        setTechniques(data || []);
      } catch (e) {
        console.error("Failed to load techniques", e);
      } finally {
        setLoading(false);
      }
    })();
    loadFlags();
    loadPlaylists();
  }, []);

  // ---------- actions ----------
  const persistFlags = async (next: string[]) => {
    setFlagged(next);
    await AsyncStorage.setItem(FLAG_KEY, JSON.stringify(next));
  };

  const toggleFlag = (id: string) => {
    const next = flagged.includes(id)
      ? flagged.filter((f) => f !== id)
      : [...flagged, id];

    logFlagEvent({
      type: flagged.includes(id) ? "unflag" : "flag",
      technique: id,
    });
    persistFlags(next);
  };
  const persistPlaylists = async (pl: Playlist[]) => {
    setPlaylists(pl);
    await AsyncStorage.setItem(PLAYLIST_KEY, JSON.stringify(pl));
  };

  const createPlaylist = (name: string) => {
    if (playlists.find((p) => p.name === name)) return;
    persistPlaylists([...playlists, { name, ids: [] }]);
  };

  const removeFromPlaylist = (playlistName: string, id: string) => {
    const updated = playlists.map((p) =>
      p.name === playlistName
        ? { ...p, ids: p.ids.filter((i) => i !== id) }
        : p,
    );

    logFlagEvent({
      type: "playlist-remove",
      technique: id,
      playlist: playlistName,
    });

    persistPlaylists(updated);
  };

  const toggleInPlaylist = (playlistName: string, id: string) => {
    const playlist = playlists.find((p) => p.name === playlistName);
    if (!playlist) return;

    if (playlist.ids.includes(id)) {
      removeFromPlaylist(playlistName, id);
    } else {
      addToPlaylist(playlistName, id);
    }
  };

  const deletePlaylist = (name: string) => {
    const updated = playlists.filter((p) => p.name !== name);
    persistPlaylists(updated);
  };

  const renamePlaylist = (oldName: string, newName: string) => {
    if (oldName === newName || playlists.find((p) => p.name === newName))
      return;
    const updated = playlists.map((p) =>
      p.name === oldName ? { ...p, name: newName } : p,
    );
    persistPlaylists(updated);
  };

  const addToPlaylist = (playlistName: string, id: string) => {
    const pl = playlists.map((p) =>
      p.name === playlistName ? { ...p, ids: [...new Set([...p.ids, id])] } : p,
    );
    persistPlaylists(pl);
  };

  const refreshData = async () => {
    setLoading(true);
    await downloadJson();
    const data = await loadLocalJson();
    setTechniques(data || []);
    setLoading(false);
  };

  const value: TechniquesContextProps = {
    techniques,
    loading,
    flagged,
    playlists,
    currentList,
    setCurrentList,
    toggleFlag,
    addToPlaylist,
    removeFromPlaylist,
    toggleInPlaylist,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    refreshData,
  };

  return (
    <TechniquesContext.Provider value={value}>
      {children}
    </TechniquesContext.Provider>
  );
};
