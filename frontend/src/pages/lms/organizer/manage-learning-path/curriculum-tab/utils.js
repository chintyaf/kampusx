// Number lessons/quizzes again so they stay in order after reorder/delete
export const decorateModules = (modules) =>
  modules.map((m, mi) => {
    let lessonNo = 0;
    let quizNo = 0;
    const items = m.items.map((it) => {
      const isQuiz = it.type === 'quiz';
      const no = isQuiz ? ++quizNo : ++lessonNo;
      return { ...it, label: `${isQuiz ? 'Quiz' : 'Lesson'} ${mi + 1}.${no}` };
    });
    return { ...m, number: mi + 1, heading: `Module ${mi + 1}: ${m.name}`, items, lessonCount: lessonNo, quizCount: quizNo };
  });

// Keep only modules/items that match the search text
export const filterModules = (modules, query) =>
  modules
    .map((m) => {
      const moduleMatch = m.heading.toLowerCase().includes(query);
      const items = moduleMatch
        ? m.items
        : m.items.filter((it) => `${it.label} ${it.title}`.toLowerCase().includes(query));
      return { ...m, items, show: moduleMatch || items.length > 0 };
    })
    .filter((m) => m.show);

export const reorderModules = (modules, fromId, toId) => {
  const from = modules.findIndex((m) => m.id === fromId);
  const to = modules.findIndex((m) => m.id === toId);
  if (from < 0 || to < 0) return modules;
  const next = [...modules];
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
};

// toItemId = null -> put the item at the end of the target module
export const moveItem = (modules, fromModuleId, itemId, toModuleId, toItemId) => {
  const item = modules.find((m) => m.id === fromModuleId)?.items.find((i) => i.id === itemId);
  if (!item) return modules;
  return modules
    .map((m) => (m.id === fromModuleId ? { ...m, items: m.items.filter((i) => i.id !== itemId) } : m))
    .map((m) => {
      if (m.id !== toModuleId) return m;
      const items = [...m.items];
      const idx = toItemId == null ? items.length : items.findIndex((i) => i.id === toItemId);
      items.splice(idx < 0 ? items.length : idx, 0, item);
      return { ...m, items };
    });
};
