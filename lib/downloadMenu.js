export function focusDownloadMenu(menu) {
  menu?.querySelector('[role="menuitem"]')?.focus({ preventScroll: true });
}

export function handleDownloadMenuKey(event, menu, trigger, close) {
  if (!menu) return;
  if (event.key === 'Escape' || event.key === 'Tab') {
    if (event.key === 'Escape') event.preventDefault();
    close();
    trigger?.focus({ preventScroll: true });
    return;
  }

  const items = [...menu.querySelectorAll('[role="menuitem"]')];
  const current = items.indexOf(document.activeElement);
  if (current === -1) return;
  const next = {
    ArrowDown: (current + 1) % items.length,
    ArrowUp: (current + items.length - 1) % items.length,
    Home: 0,
    End: items.length - 1,
  }[event.key];
  if (!Number.isInteger(next)) return;
  event.preventDefault();
  items[next].focus({ preventScroll: true });
}
