import React, { useMemo, useState } from "react";
import {
  View,
  SectionList,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { primary, secondary, secondary2, secondary3 } from "@/style/variables";
import { usePlayer } from "@/context/PlayerContext";
import { useOffline } from "@/context/OfflineContext";
import { router } from "expo-router";
import { sourates } from "../../constants/sorats.list";
import {
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome,
  Feather,
} from "@expo/vector-icons";
import { ConfirmDialog } from "react-native-simple-dialogs";
import { LinearGradient } from "expo-linear-gradient";
import { EmptyList } from "../../components/EmptyList";
import * as Progress from "react-native-progress";

// Recherche tolérante aux accents.
const normalize = value =>
  String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

// Statut global d'un passage à partir des statuts de ses versets.
// Un passage sans suivi (anciens téléchargements) est considéré complet.
const getLessonStatus = (lesson, downloadState) => {
  const versets = downloadState[lesson.id]?.versets;
  if (!versets) return "complete";
  const values = Object.values(versets);
  if (values.some(s => s === "downloading" || s === "pending"))
    return "downloading";
  if (values.some(s => s === "error")) return "error";
  return "complete";
};

const STATUS_FILTERS = [
  { key: "all", label: "Tous" },
  { key: "complete", label: "Complets" },
  { key: "downloading", label: "En cours" },
  { key: "error", label: "Erreurs" },
];

// Pastille de statut d'un verset : ✓ téléchargé, spinner en cours,
// bouton "réessayer" si erreur.
const VerseChip = ({ verseNumber, status, onRetry }) => {
  if (status === "error") {
    return (
      <Pressable style={[styles.verseChip, styles.verseChipError]} onPress={onRetry}>
        <MaterialCommunityIcons name="refresh" size={13} color="#fff" />
        <Text style={styles.verseChipErrorText}>v-{verseNumber}</Text>
      </Pressable>
    );
  }

  const isActive = status === "downloading";
  return (
    <View
      style={[
        styles.verseChip,
        status === "done" && styles.verseChipDone,
        isActive && styles.verseChipActive,
      ]}
    >
      {isActive ? (
        <Progress.Circle size={12} indeterminate borderWidth={1.5} color={primary} />
      ) : status === "done" ? (
        <MaterialCommunityIcons name="check" size={13} color="#2e7d32" />
      ) : (
        <MaterialCommunityIcons name="clock-outline" size={13} color={secondary} />
      )}
      <Text style={[styles.verseChipText, status === "done" && styles.verseChipDoneText]}>
        v-{verseNumber}
      </Text>
    </View>
  );
};

const Item = ({ item, index }) => {
  const { isLoading, isPlaying, loadSelectLesson } = usePlayer();
  const {
    onDeleteLesson,
    isDeleting,
    downloadProgressId,
    downloadState,
    retryVerset,
    activeLessonId,
    isOfflineMode,
  } = useOffline();

  const [dialogVisible, setDialogVisible] = useState(false);

  const handleSelectLesson = async () => {
    router.push({ pathname: `player/l-${item.index}` });
    loadSelectLesson(item);
  };

  // ---- Synthèse du statut de téléchargement du passage ----
  const versetsStatus = downloadState[item.id]?.versets || null;
  const statusEntries = versetsStatus ? Object.entries(versetsStatus) : [];
  const totalCount = statusEntries.length;
  const doneCount = statusEntries.filter(([, s]) => s === "done").length;
  const errorCount = statusEntries.filter(([, s]) => s === "error").length;
  const isDownloading = statusEntries.some(
    ([, s]) => s === "downloading" || s === "pending"
  );
  // Le suivi n'est affiché que s'il reste quelque chose à faire :
  // téléchargement en cours ou versets en erreur.
  const showDownloadSection = versetsStatus && (isDownloading || errorCount > 0);

  // Passage actuellement chargé dans le lecteur.
  const isActiveLesson = isOfflineMode && activeLessonId === item.id;

  const isPending = (isLoading && isPlaying) || downloadProgressId === item.id;

  return (
    <Pressable
      style={({ pressed }) => [
        { pointerEvents: isPending || isDeleting ? "none" : "auto" },
        styles.cardContainer,
        pressed && styles.pressed,
        (isPending || isDeleting) && styles.disabled,
      ]}
      onPress={handleSelectLesson}
      disabled={isLoading && isPlaying}
    >
      <LinearGradient
        colors={["#ffffff", "#f8f9fa"]}
        style={[styles.card, isActiveLesson && styles.cardActive]}
      >
        <View style={styles.cardRow}>
          <View style={styles.leftContent}>
            <View style={[styles.courseNumber, isActiveLesson && styles.courseNumberActive]}>
              {isActiveLesson ? (
                <MaterialCommunityIcons name="headphones" size={20} color="#fff" />
              ) : (
                <Text style={styles.courseNumberText}>{index + 1}</Text>
              )}
            </View>
            <View style={styles.courseInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.lessonTitle}>
                  <FontAwesome name="download" size={14} color={primary} /> Passage {" "}
                  {String(index + 1).padStart(2, "0")}
                </Text>
                {/* Indicateur : passage en cours d'écoute */}
                {isActiveLesson && (
                  <View style={styles.playingBadge}>
                    <MaterialCommunityIcons name="volume-high" size={12} color="#fff" />
                    <Text style={styles.playingBadgeText}>En écoute</Text>
                  </View>
                )}
              </View>
              <View style={styles.suratInfo}>
                <Ionicons name="bookmark" size={14} color={secondary} />
                <Text style={styles.suratText}>
                  {sourates[parseFloat(item.index)]?.nom}
                </Text>
              </View>
              <View style={styles.versetRange}>
                <MaterialCommunityIcons
                  name="format-quote-open"
                  size={14}
                  color={secondary}
                />
                <Text style={styles.versetText}>
                  Versets {item.selectSartVerset} - {item.selectEndVerset}
                </Text>
              </View>
              {/* Réciteur du passage (absent sur les anciens téléchargements) */}
              {item.reciter && (
                <View style={styles.reciterInfo}>
                  <MaterialCommunityIcons
                    name="microphone-outline"
                    size={14}
                    color={secondary}
                  />
                  <Text style={styles.reciterText}>{item.reciter}</Text>
                </View>
              )}
            </View>
          </View>

          <Pressable
            style={styles.deleteButton}
            onPress={() => setDialogVisible(true)}
            hitSlop={10}
          >
            {isDeleting ? (
              <View style={styles.loaderContainer}>
                <Progress.Circle
                  size={24}
                  indeterminate
                  borderWidth={2}
                  color={primary}
                  borderColor="rgba(0, 0, 0, 0.1)"
                />
              </View>
            ) : (
              <MaterialCommunityIcons
                name="delete-outline"
                size={24}
                color="#dc3545"
              />
            )}
          </Pressable>
        </View>

        {/* ---- Suivi du téléchargement : visible UNIQUEMENT si en cours
             ou en erreur ; un passage complet n'affiche rien. ---- */}
        {showDownloadSection && (
          <View style={styles.downloadSection}>
            <View style={styles.downloadHeader}>
              {isDownloading ? (
                <Text style={styles.downloadStatusText}>
                  Téléchargement en cours… {doneCount}/{totalCount}
                </Text>
              ) : (
                <Text style={[styles.downloadStatusText, styles.downloadStatusError]}>
                  {errorCount} verset{errorCount > 1 ? "s" : ""} en erreur — appuyez pour réessayer
                </Text>
              )}
            </View>
            <Progress.Bar
              progress={totalCount > 0 ? doneCount / totalCount : 0}
              width={null}
              height={5}
              color={errorCount > 0 && !isDownloading ? "#dc3545" : primary}
              unfilledColor="rgba(0,0,0,0.06)"
              borderWidth={0}
              style={styles.downloadBar}
            />
            <View style={styles.verseChipsRow}>
              {statusEntries.map(([verseNumber, status]) => (
                <VerseChip
                  key={verseNumber}
                  verseNumber={verseNumber}
                  status={status}
                  onRetry={() => retryVerset(item.id, Number(verseNumber))}
                />
              ))}
            </View>
          </View>
        )}

        <ConfirmDialog
          title="Confirmer la suppression"
          message="Êtes-vous sûr de vouloir supprimer ce passage ?"
          visible={dialogVisible}
          onTouchOutside={() => setDialogVisible(false)}
          positiveButton={{
            title: "Supprimer",
            titleStyle: { color: primary },
            onPress: () => {
              onDeleteLesson(item.id);
              setDialogVisible(false);
            },
          }}
          negativeButton={{
            title: "Annuler",
            titleStyle: { color: primary },
            onPress: () => setDialogVisible(false),
          }}
        />
      </LinearGradient>
    </Pressable>
  );
};

export default function Lessons() {
  const { lessonList, downloadState } = useOffline();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Recherche + filtre par statut, puis regroupement par sourate.
  const sections = useMemo(() => {
    const q = normalize(query);

    const filtered = lessonList.filter(lesson => {
      const nom = sourates[parseFloat(lesson.index)]?.nom || "";
      if (q && !normalize(nom).includes(q)) return false;
      if (
        statusFilter !== "all" &&
        getLessonStatus(lesson, downloadState) !== statusFilter
      )
        return false;
      return true;
    });

    const bySourate = new Map();
    filtered.forEach(lesson => {
      const nom = sourates[parseFloat(lesson.index)]?.nom || "Autre";
      if (!bySourate.has(nom)) bySourate.set(nom, []);
      bySourate.get(nom).push(lesson);
    });

    return [...bySourate.entries()].map(([title, data]) => ({ title, data }));
  }, [lessonList, downloadState, query, statusFilter]);

  if (!lessonList.length) {
    return (
      <EmptyList
        title={"Hors ligne"}
        desc={"Aucun passage de versets n'a été téléchargé"}
      />
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {/* Recherche par sourate */}
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={secondary} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher une sourate…"
            placeholderTextColor={secondary2}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Feather
              name="x"
              size={18}
              color={secondary}
              onPress={() => setQuery("")}
            />
          )}
        </View>

        {/* Filtres par statut */}
        <View style={styles.filtersRow}>
          {STATUS_FILTERS.map(filter => (
            <Pressable
              key={filter.key}
              style={[
                styles.filterChip,
                statusFilter === filter.key && styles.filterChipActive,
              ]}
              onPress={() => setStatusFilter(filter.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === filter.key && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {sections.length === 0 ? (
          <View style={styles.noResult}>
            <Feather name="inbox" size={40} color={secondary2} />
            <Text style={styles.noResultText}>Aucun passage ne correspond</Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            renderItem={({ item, index }) => <Item index={index} item={item} />}
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeader}>
                <Ionicons name="book-outline" size={15} color={primary} />
                <Text style={styles.sectionHeaderText}>{section.title}</Text>
                <Text style={styles.sectionHeaderCount}>
                  {section.data.length}
                </Text>
              </View>
            )}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: secondary3,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    height: 44,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: primary,
  },
  filtersRow: {
    flexDirection: "row",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 10,
  },
  filterChip: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterChipActive: {
    backgroundColor: primary,
  },
  filterChipText: {
    fontSize: 13,
    color: secondary,
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    marginTop: 4,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: "bold",
    color: primary,
    textTransform: "capitalize",
  },
  sectionHeaderCount: {
    fontSize: 12,
    color: secondary,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 1,
    overflow: "hidden",
  },
  noResult: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  noResultText: {
    color: secondary,
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  cardContainer: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "white",
  },
  cardActive: {
    borderWidth: 1.5,
    borderColor: primary,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.6,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  courseNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  courseNumberActive: {
    backgroundColor: "#2e7d32",
  },
  courseNumberText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  courseInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: primary,
  },
  playingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#2e7d32",
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  playingBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  suratInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  suratText: {
    fontSize: 13,
    color: secondary,
    marginLeft: 6,
  },
  versetRange: {
    flexDirection: "row",
    alignItems: "center",
  },
  versetText: {
    fontSize: 13,
    color: secondary,
    marginLeft: 6,
  },
  reciterInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  reciterText: {
    fontSize: 13,
    color: secondary,
    marginLeft: 6,
    textTransform: "capitalize",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(220, 53, 69, 0.1)",
  },
  loaderContainer: {
    position: "relative",
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  downloadHeader: {
    marginBottom: 6,
  },
  downloadStatusText: {
    fontSize: 12,
    color: secondary,
    fontWeight: "600",
  },
  downloadStatusError: {
    color: "#dc3545",
  },
  downloadBar: {
    marginBottom: 10,
  },
  verseChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  verseChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  verseChipActive: {
    backgroundColor: "rgba(75, 46, 46, 0.08)",
  },
  verseChipDone: {
    backgroundColor: "rgba(46, 125, 50, 0.1)",
  },
  verseChipError: {
    backgroundColor: "#dc3545",
  },
  verseChipText: {
    fontSize: 11,
    color: secondary,
    fontWeight: "600",
  },
  verseChipDoneText: {
    color: "#2e7d32",
  },
  verseChipErrorText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },
});
