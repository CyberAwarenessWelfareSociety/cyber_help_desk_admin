import { useCallback, useEffect, useState } from "react";
import { FaComments, FaSpinner, FaTimes, FaTrashAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../../Utils/api";
import styles from "./ChatParticipationModal.module.css";

const ChatParticipationModal = ({ client, onClose }) => {
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingChatId, setRemovingChatId] = useState(null);
  const [removingAll, setRemovingAll] = useState(false);

  const loadParticipations = useCallback(async () => {
    if (!client?.id) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/chat/client/${client.id}/participations`);
      setParticipations(data?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load chat list");
    } finally {
      setLoading(false);
    }
  }, [client?.id]);

  useEffect(() => {
    loadParticipations();
  }, [loadParticipations]);

  const removeOne = async (chatId) => {
    setRemovingChatId(chatId);
    try {
      await api.delete(`/chat/client/${client.id}/participations/${chatId}`);
      setParticipations((current) => current.filter((item) => item.chat_id !== chatId));
      toast.success("Client removed from chat");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove chat participation");
    } finally {
      setRemovingChatId(null);
    }
  };

  const removeAll = async () => {
    if (!window.confirm(`Remove ${client.name || "this client"} from every chat?`)) return;
    setRemovingAll(true);
    try {
      const { data } = await api.delete(`/chat/client/${client.id}/participations`);
      setParticipations([]);
      toast.success(data?.message || "All chat participations removed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove chat participations");
    } finally {
      setRemovingAll(false);
    }
  };

  const busy = removingAll || removingChatId !== null;

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-participation-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <div>
            <h2 id="chat-participation-title"><FaComments /> Chat Participation</h2>
            <p>{client.name || client.full_name || client.email || client.id}</p>
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        <div className={styles.toolbar}>
          <span>{participations.length} chat{participations.length === 1 ? "" : "s"}</span>
          <button
            className={styles.removeAllButton}
            onClick={removeAll}
            disabled={loading || busy || participations.length === 0}
          >
            {removingAll ? <FaSpinner className={styles.spin} /> : <FaTrashAlt />}
            Remove from every chat
          </button>
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.state}><FaSpinner className={styles.spin} /> Loading chats...</div>
          ) : participations.length === 0 ? (
            <div className={styles.state}>This client is not participating in any chat.</div>
          ) : (
            <div className={styles.chatList}>
              {participations.map((participation) => {
                const chat = participation.Chat || {};
                const isRemoving = removingChatId === participation.chat_id;
                return (
                  <div className={styles.chatRow} key={participation.id || participation.chat_id}>
                    <div className={styles.chatDetails}>
                      <strong>{chat.title?.trim() || `Chat ${participation.chat_id.slice(0, 8)}`}</strong>
                      <span>{chat.status || "UNKNOWN"} · {participation.role_in_chat || "USER"}</span>
                    </div>
                    <button
                      className={styles.removeButton}
                      onClick={() => removeOne(participation.chat_id)}
                      disabled={busy}
                    >
                      {isRemoving ? <FaSpinner className={styles.spin} /> : <FaTrashAlt />}
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatParticipationModal;
