export function useDebounced<T>(source: Ref<T>, ms = 200) {
  const out = ref(source.value) as Ref<T>
  let t: ReturnType<typeof setTimeout> | undefined
  watch(source, (v) => { clearTimeout(t); t = setTimeout(() => (out.value = v), ms) })
  return out
}
