<script>
  /**
   * Кнопка-иконка. Иконка передаётся через children.
   * variant: 'ghost' — прозрачная круглая (тулбары выделения),
   *          'outline' — круглая 40px с обводкой (плеер),
   *          'square' — квадратная 28px (панели настроек/логов).
   * @type {{ variant?: 'ghost' | 'outline' | 'square', onclick?: (e: MouseEvent) => void, class?: string, children?: import('svelte').Snippet, [key: string]: any }}
   */
  let { variant = 'ghost', onclick, class: className = '', children, ...rest } = $props();
</script>

<button type="button" class="icon-button icon-button--{variant} {className}" {onclick} {...rest}>
  {@render children?.()}
</button>

<style>
  .icon-button {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: none;
    background: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
  }
  .icon-button:focus-visible {
    outline: 2px solid var(--stroke-themed, #007aff);
    outline-offset: 2px;
  }

  .icon-button--ghost {
    padding: 8px;
    border-radius: 50%;
    color: #eee;
  }
  .icon-button--ghost:hover { background-color: rgba(255, 255, 255, 0.1); }
  .icon-button--ghost:active { transform: scale(0.95); }

  .icon-button--outline {
    width: 40px;
    height: 40px;
    padding: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #e4e6eb;
  }
  .icon-button--outline:hover {
    background: rgba(255, 255, 255, 0.2);
    color: var(--text-primary);
    transform: scale(1.05);
  }
  .icon-button--outline:active { transform: scale(0.96); }

  .icon-button--square {
    width: 28px;
    height: 28px;
    padding: 0;
    border-radius: 6px;
    background: #2b2b33;
    color: #bbb;
    font-size: 14px;
    font-weight: 600;
  }
  .icon-button--square:hover { background: #383844; color: var(--text-primary); }
  .icon-button--square :global(img) { width: 14px; height: 14px; opacity: 0.8; }
  .icon-button--square:hover :global(img) { opacity: 1; }
</style>
