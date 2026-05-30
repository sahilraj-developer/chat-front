import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { IconClose } from "./icons";
import assets from "../assets/assets";

const CreateCommunityModal = ({ onClose, mode = "create" }) => {
  const { createCommunity, joinCommunity } = useContext(ChatContext);
  const { axios } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "create") {
      axios.get("/api/communities/users").then(({ data }) => {
        if (data.success) setAllUsers(data.users);
      });
    }
  }, [axios, mode]);

  const toggleMember = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "join") {
      await joinCommunity(inviteCode);
    } else {
      await createCommunity({ name, description, memberIds: selected });
    }
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center wa-modal-backdrop p-4">
      <div className="wa-modal w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--wa-border)] px-4 py-3">
          <h2 className="text-lg font-medium text-[var(--wa-text)]">
            {mode === "join" ? "Join community" : "New community"}
          </h2>
          <button type="button" onClick={onClose} className="wa-btn-ghost">
            <IconClose />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {mode === "join" ? (
            <input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Invite code"
              className="wa-input w-full uppercase"
              required
            />
          ) : (
            <>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Community name"
                className="wa-input w-full"
                required
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="wa-input w-full min-h-[80px]"
              />
              <p className="text-sm text-[var(--wa-text-secondary)]">Add members</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {allUsers.map((u) => (
                  <label
                    key={u._id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-[var(--wa-hover)] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(u._id)}
                      onChange={() => toggleMember(u._id)}
                      className="accent-[var(--wa-accent)]"
                    />
                    <img src={u.profilePic || assets.avatar_icon} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <span className="text-[var(--wa-text)]">{u.fullName}</span>
                  </label>
                ))}
              </div>
            </>
          )}
          <button type="submit" disabled={loading} className="wa-btn-primary w-full">
            {loading ? "Please wait..." : mode === "join" ? "Join" : "Create community"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunityModal;
