<script>
  import { createEventDispatcher } from "svelte";
  import { get } from "svelte/store";
  import {
    currentUser,
    currentSessionChats,
  } from "$lib/stores/api";
  import {
    getContact
  } from "$lib/stores/contacts";
  import {
    getAttachText,
    getSystemText,
  } from "$lib/utils/attachs";
  import Session, {
    openChat,
    get as sessionGet
  } from "$lib/stores/session";
  import {
    getChat
  } from "$lib/stores/messages";
  import { isChatMuted } from "$lib/utils/notifications";

  import Avatar from "$components/main/Avatar.svelte";

  export let chat;
  export let replace;
  export let isSelected = false;
  export let selectionMode = false;

  const dispatch = createEventDispatcher();

  $: currentChat = $currentSessionChats?.find((x) => String(x.id) === String(chat?.id)) || chat;
  $: unread = currentChat?.newMessages ?? 0;

  $: peerId = (() => {
    if (chat.type !== "DIALOG") return null;
    if (chat.participants && Object.keys(chat.participants).length > 0) {
      const other = Object.keys(chat.participants).find(id => String(id) !== String($currentUser));
      if (other) return Number(other);
    }
    if ($currentUser != null && chat.id != null) {
      try {
        return Number(BigInt(chat.id) ^ BigInt($currentUser));
      } catch (e) {
        return null;
      }
    }
    return null;
  })();

  $: contact = getContact(peerId);

  $: muted = isChatMuted(currentChat);
  $: isBot = $contact?.options?.includes("BOT") || chat?.options?.BOT === true || chat?.options?.IS_BOT === true;

  $: title =
    chat.id === 0
      ? "Избранное"
      : chat.title || $contact?.names?.[0]?.name || "Без названия";

  $: cachedChat = getChat(chat.id);
  $: receivedMessage = cachedChat.receivedMessage;
  $: shownMessage = (() => {
    if (replace?.message) return replace.message;
    const fromChat = currentChat?.lastMessage || chat?.lastMessage;
    const fromReceived = $receivedMessage;
    if (!fromReceived) return fromChat;
    if (!fromChat) return fromReceived;
    return (fromReceived.time || 0) >= (fromChat.time || 0) ? fromReceived : fromChat;
  })();
  $: attaches = getAttachText(currentChat || chat, shownMessage);

  $: timeDisplay = (() => {
    if (!shownMessage?.time) return "";
    const msgDate = new Date(shownMessage.time + sessionGet("drift"));
    const now = new Date();
    const isToday =
      msgDate.getDate() === now.getDate() &&
      msgDate.getMonth() === now.getMonth() &&
      msgDate.getFullYear() === now.getFullYear();
    if (isToday)
      return msgDate.toLocaleTimeString("ru", {
        hour: "2-digit",
        minute: "2-digit",
      });
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (msgDate.getDate() === yesterday.getDate()) return "Вчера";
    return msgDate.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
  })();

  $: isMe = String(shownMessage?.sender) === String($currentUser) || String(shownMessage?.from) === String($currentUser);
  $: isRead = shownMessage?.read;

  let pressTimer;
  let isLongPress = false;

  function handleStart() {
    isLongPress = false;
    pressTimer = setTimeout(() => {
      isLongPress = true;
      dispatch("longpress", chat);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 250);
  }

  function handleEnd() {
    clearTimeout(pressTimer);
  }

  function handleMove() {
    clearTimeout(pressTimer);
  }

  function handleClick() {
    if (isLongPress) return;

    if (selectionMode) {
      dispatch("toggle", chat);
    } else {
      openChat(chat.id);
    }
  }
</script>

<div class="item">
  <div
    class="wrapper wrapper--withActions"
    class:selected={isSelected}
    on:mousedown={handleStart}
    on:touchstart|passive={handleStart}
    on:mouseup={handleEnd}
    on:touchend={handleEnd}
    on:touchmove|passive={handleMove}
    on:contextmenu|preventDefault={() => dispatch("longpress", chat)}
  >
    <button class="cell" on:click={handleClick}>
      <div
        class="avatar"
        on:click|stopPropagation={() => {
          if (selectionMode) {
            handleClick();
            return;
          }
          if (chat.id === 0) {
            $Session.profile = { userId: $currentUser, chatId: 0 };
          } else if (chat.type === "DIALOG") {
            $Session.profile = { userId: peerId, chatId: chat.id };
          } else {
            $Session.profile = { chatId: chat.id };
          }
        }}
      >
        <div class="avatarComposition">
          <div class="avatarBadgeWrapper" style="--avatarSize: 54px;">
            <Avatar
              {chat}
              contactId={peerId}
              size={54}
              {selectionMode}
              {isSelected}
            />
          </div>
        </div>
      </div>

      <h3 class="title">
        <span class="name">
          <span class="text">
            {#if isBot}
              <svg class="bot-badge-icon" width="16" height="16"><use href="#icon_bot_mini"></use></svg>
            {/if}
            {title}
          </span>
        </span>
      </h3>

      <div class="indicators">
        {#if muted}
          <svg class="muted-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#8e8e93" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            <line x1="2" y1="2" x2="22" y2="22"></line>
          </svg>
        {/if}
        {#if isMe}
          <span class="status-icon" class:read={isRead}>
            {isRead ? "✓✓" : "✓"}
          </span>
        {/if}
      </div>

      <div class="meta">
        <span class="time" aria-label={timeDisplay}>{timeDisplay}</span>
      </div>

      <span class="text preview-text">
        {#if isMe}<span class="you-prefix">Вы:</span>{/if}
        {#if attaches}
          <b>{attaches}</b>{#if shownMessage?.text}, {/if}
        {/if}
        {#if replace}
          {@html replace.text}
        {:else}
          {(shownMessage?.text || getSystemText(shownMessage, false) || "").replace(/<[^>]*>/g, "")}
        {/if}
      </span>

      <div class="icons">
        {#if unread > 0}
          <div class="badge" class:muted style={unread >= 99 ? "width: 26px;" : ""}>
            {unread > 99 ? "99+" : unread}
          </div>
        {/if}
      </div>
    </button>

    <div class="actions">
      <button class="menuButton" aria-label="Еще">
        <svg width="16" height="16"><use href="#icon_dots_horizontal_mini"></use></svg>
      </button>
    </div>
  </div>
</div>

<style>
  .item {
    position: relative;
  }

  .wrapper {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.15s;
    gap: 12px;
    border-radius: 12px;
    margin: 0 8px;
    user-select: none;
  }

  .wrapper:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  .wrapper.selected {
    background-color: rgba(59, 130, 246, 0.15);
  }

  .wrapper--withActions .actions {
    opacity: 0;
    transition: opacity 0.15s;
  }

  .wrapper--withActions:hover .actions {
    opacity: 1;
  }

  .cell {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
    gap: 2px 8px;
    flex: 1;
    min-width: 0;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    text-align: left;
    color: inherit;
    font: inherit;
  }

  .avatar {
    grid-row: 1 / 3;
    grid-column: 1 / -1;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    flex-shrink: 0;
    width: 54px;
    height: 54px;
    cursor: pointer;
    border-radius: 50%;
    transition: opacity 0.15s ease;
  }

  .avatar:hover {
    opacity: 0.88;
  }

  .wrapper {
    position: relative;
    padding-left: 66px;
    min-height: 70px;
  }

  .avatarComposition {
    width: 100%;
    height: 100%;
  }

  .avatarBadgeWrapper {
    width: var(--avatarSize, 54px);
    height: var(--avatarSize, 54px);
  }

  .title {
    grid-row: 1;
    grid-column: 1;
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary, #fff);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    line-height: 1.3;
  }

  .name {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }

  .name .text {
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .name .icon {
    flex-shrink: 0;
    display: flex;
    color: #007AFF;
  }

  .name .icon svg {
    width: 16px;
    height: 16px;
  }

  .indicators {
    display: inline-flex;
    gap: 4px;
    flex-shrink: 0;
    align-items: center;
    margin-left: 4px;
  }

  .meta {
    grid-row: 1;
    grid-column: 2;
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    justify-content: flex-end;
  }

  .preview-text {
    grid-row: 2;
    grid-column: 1;
    font-size: 14px;
    color: #8E8E93;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 0;
    line-height: 1.3;
  }

  .preview-text .emoji img {
    width: 1.25em;
    height: 1.25em;
    object-fit: cover;
    vertical-align: middle;
  }

  .preview-text .media img {
    width: 1.25em;
    height: 1.25em;
    border-radius: 4px;
    object-fit: cover;
  }

  .preview-text .shareIcon {
    display: inline-flex;
    color: #8E8E93;
  }

  .preview-text .shareIcon svg {
    width: 16px;
    height: 16px;
  }

  .time {
    font-size: 12px;
    color: #8E8E93;
    white-space: nowrap;
  }

  .icons {
    grid-row: 2;
    grid-column: 2;
    display: flex;
    gap: 4px;
    flex-shrink: 0;
    align-items: center;
    justify-content: flex-end;
  }

  .actions {
    flex-shrink: 0;
    display: flex;
  }

  .menuButton {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: #8E8E93;
    display: flex;
    align-items: center;
    border-radius: 50%;
  }

  .menuButton:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .badge {
    background-color: var(--badge-unread, #007AFF);
    color: white;
    font-size: 11px;
    font-weight: bold;
    min-width: 20px;
    height: 20px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 6px;
  }

  .badge.muted {
    background-color: #4B4B56;
    color: #bbb;
  }

  .you-prefix {
    color: #fff;
  }

  .status-icon {
    font-size: 12px;
    color: #8E8E93;
  }

  .status-icon.read {
    color: var(--status-success, #34C759);
  }

  .muted-icon {
    opacity: 0.85;
    display: inline-block;
    vertical-align: -1px;
  }

  .bot-badge-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    display: inline-flex;
    color: #8E8E93;
  }
</style>
