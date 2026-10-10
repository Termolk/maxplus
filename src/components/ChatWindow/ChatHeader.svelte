<script>
  import { IconButton } from "$components/ui";
  import { createEventDispatcher } from "svelte";
  import Avatar from "$components/main/Avatar.svelte";
  import Signature from "$components/main/Signature.svelte";
  import Session from "$lib/stores/session";
  import { currentUser } from "$lib/stores/api";
  import { getChatSettings } from "$lib/stores/messages";

  export let chat;
  export let avatarUserId;
  export let title = "";

  const dispatch = createEventDispatcher();

  $: chatSettings = chat?.id != null ? getChatSettings(chat.id) : null;
  $: fingerprint = $chatSettings?.session?.fingerprint;

  function getFingerprintEmojis(val) {
    if (!val) return [];
    let raw = [];
    if (Array.isArray(val)) {
      raw = val;
    } else if (typeof Intl !== "undefined" && Intl.Segmenter) {
      raw = Array.from(new Intl.Segmenter().segment(String(val)), (s) => s.segment);
    } else {
      raw = Array.from(String(val));
    }
    return raw.filter((s) => s.trim().length > 0).slice(0, 4);
  }

  function handleClose() {
    dispatch("close");
  }

  function handleOpenSettings() {
    dispatch("openSettings");
  }

  function handleSearch() {
    dispatch("search");
  }

  $: isOfficial = !!(chat?.official || chat?.verified || chat?.isOfficial || chat?.options?.OFFICIAL || chat?.options?.official);

  function handleProfileClick() {
    if (!chat) return;
    if (chat.id === 0) {
      $Session.profile = { userId: $currentUser, chatId: 0 };
    } else if (chat.type === "DIALOG") {
      $Session.profile = { userId: avatarUserId, chatId: chat.id };
    } else {
      $Session.profile = { chatId: chat.id };
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpenSettings();
    }
  }
</script>

<header
  class="reference-chat-header"
  style="box-sizing: border-box; display: flex; align-items: center; flex-shrink: 0; width: 100%; min-width: 0; height: calc(64px + env(safe-area-inset-top, 0px)); min-height: calc(64px + env(safe-area-inset-top, 0px)); padding: calc(8px + env(safe-area-inset-top, 0px)) 12px 8px; gap: 8px; background: var(--bg-surface, #fff); color: var(--text-primary, #303030); border-bottom: none; box-shadow: none;"
>
  <div class="align-left" style="display: flex; align-items: center; flex: 1; min-width: 0; gap: 12px; overflow: hidden;">
    <IconButton class="chatheader-icon-button" onclick={(e) => { e.stopPropagation(); handleClose(); }} aria-label="Назад">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M19 12H5m7-7-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </IconButton>
    <div
      class="row"
      style="display: flex; align-items: center; flex: 1; min-width: 0; gap: 12px; overflow: hidden;"
      on:click={handleProfileClick}
    >
      <Avatar size={40} {chat} contactId={avatarUserId} style="flex-shrink: 0; cursor: pointer;"/>
      <div class="info" style="display: flex; flex-direction: column; justify-content: center; flex: 1; min-width: 0; gap: 2px; overflow: hidden;">
        <div class="title-row" style="display: flex; align-items: center; gap: 4px; min-width: 0; max-width: 100%;">
          <a class="title" style="display: block; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 16px; font-weight: 600; line-height: 21px; color: inherit;">{title}</a>
          {#if isOfficial}
            <svg class="verified-badge" width="18" height="18" viewBox="0 0 24 24" aria-label="Официальный" style="flex-shrink: 0;">
              <path fill="#2D9CFF" d="M12 1.5l2.6 1.9 3.2-.1 1 3.1 2.6 1.9-1 3.1 1 3.1-2.6 1.9-1 3.1-3.2-.1L12 22.5l-2.6-1.9-3.2.1-1-3.1-2.6-1.9 1-3.1-1-3.1 2.6-1.9 1-3.1 3.2.1z" />
              <path d="M8 12.3l2.6 2.6 5.6-5.6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          {/if}
        </div>
        <a class="presence" style="display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; font-weight: 400; line-height: 18px; color: var(--text-secondary, #808080);"><Signature {chat} contactId={avatarUserId} /></a>
      </div>
    </div>
  </div>
  <div class="align-right">
    {#if chat && chat.type !== "CHANNEL" && chat.type !== "CHAT"}
      {#if fingerprint}
        <div
          class="fingerprint-badge"
          role="button"
          tabindex="0"
          on:click|stopPropagation={handleOpenSettings}
          on:keydown|stopPropagation={handleKeyDown}
          title="Ключ сессии: {fingerprint}"
          aria-label="Ключ сессии"
        >
          <div class="fingerprint-grid">
            {#each getFingerprintEmojis(fingerprint) as emoji}
              <span>{emoji}</span>
            {/each}
          </div>
        </div>
      {/if}
    {/if}
    <IconButton class="chatheader-icon-button" onclick={handleSearch} aria-label="Поиск по чату">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
        <path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </IconButton>
    <IconButton class="chatheader-icon-button" onclick={handleOpenSettings} aria-label="Настройки чата">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="5" r="1.8" />
        <circle cx="12" cy="12" r="1.8" />
        <circle cx="12" cy="19" r="1.8" />
      </svg>
    </IconButton>
  </div>
</header>

<style>
  header.reference-chat-header {
    min-height: calc(64px + env(safe-area-inset-top, 0px));
    padding: calc(8px + env(safe-area-inset-top, 0px)) 12px 8px;
    gap: 8px;
    background-color: var(--bg-surface, #fff);
    color: var(--text-primary, #303030);
    cursor: default;
    box-shadow: none;
    border-bottom: none;
  }

  .reference-chat-header .align-left {
    display: flex;
    align-items: center;
    flex: 1 1 0;
    min-width: 0;
    gap: 8px;
  }

  .reference-chat-header .row {
    flex: 1 1 0;
    min-width: 0;
    gap: 12px;
    overflow: hidden;
  }

  .reference-chat-header .info {
    display: flex;
    flex-direction: column;
    flex: 1 1 0;
    min-width: 0;
    gap: 3px;
    overflow: hidden;
  }

  .reference-chat-header .title {
    display: block;
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 17px;
    font-weight: 600;
    line-height: 22px;
    color: inherit;
    text-decoration: none;
  }

  .reference-chat-header .presence {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 13px;
    line-height: 17px;
    color: var(--text-secondary, #808080);
    text-decoration: none;
  }

  .reference-chat-header .align-right {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    gap: 4px;
    margin-left: auto;
  }

  .reference-chat-header :global(.chatheader-icon-button) {
    flex: 0 0 40px;
    width: 40px;
    height: 40px;
    padding: 8px;
    color: inherit;
  }

  @media (prefers-color-scheme: light) {
    header.reference-chat-header {
      background-color: #fff;
    }
  }
  header {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    min-height: 60px;
    padding: 8px 0;
    padding-top: calc(8px + env(safe-area-inset-top, 0px));
    cursor: grab;
    flex-shrink: 0;
    background-color: var(--bg-surface, #f6f6fb);
    z-index: 5;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    flex: 1;
    min-width: 0;
    padding-left: 6px;
  }

  header .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 3px;
    overflow: hidden;
    min-width: 0;
  }

  header .info .presence {
    color: var(--text-secondary, #808080);
    font-size: 14px;
    line-height: 18px;
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    min-width: 0;
  }

  header .title {
    color: var(--text-primary, #111111);
    font-size: 17px;
    line-height: 22px;
    font-weight: 600;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  header .align-left {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex: 1;
    min-width: 0;
  }

  header .align-right {
    flex: 0 0 auto;
    margin-left: auto;
    margin-right: 8px;
    display: flex;
    align-items: center;
  }

  :global(.chatheader-icon-button)  { width: 40px; flex-shrink: 0; }

  :global(.chatheader-icon-button) img  { transform: scale(1.1) translateX(-5px); }

  .fingerprint-badge {
    border: none;
    background: transparent;
    border-radius: 6px;
    margin-right: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
  }

  .fingerprint-grid {
    display: grid;
    grid-template-columns: 14px 14px;
    grid-template-rows: 14px 14px;
    gap: 2px;
    width: 30px;
    height: 30px;
    box-sizing: border-box;
  }

  .fingerprint-grid span {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    font-size: 11px;
    line-height: 1;
    overflow: hidden;
  }
</style>
