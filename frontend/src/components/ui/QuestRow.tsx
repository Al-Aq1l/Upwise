import { Check, X } from "lucide-react";
import { Quest } from "@/hooks/useQuests";

type QuestRowProps = {
  quest: Quest;
  onToggle: (id: number) => void;
  onDelete?: (id: number) => void;
  removable?: boolean;
};

export default function QuestRow({ quest, onToggle, onDelete, removable = false }: QuestRowProps) {
  return (
    <div className={`quest-row ${quest.completed ? "done" : ""}`}>
      <button
        className="check-btn"
        aria-label="Selesaikan quest"
        onClick={() => onToggle(quest.id)}
      >
        {quest.completed && <Check size={14} />}
      </button>
      <div className="quest-info">
        <strong>{quest.title}</strong>
        <span>
          {quest.category} · {quest.difficulty} · {quest.exp_reward} EXP
        </span>
      </div>
      {removable && onDelete && (
        <button
          className="icon-btn remove-quest-btn"
          aria-label="Hapus quest"
          onClick={() => onDelete(quest.id)}
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
