export interface PaletteCommand {
  id: string
  label: string
  description?: string
  icon?: string
  group?: string
  shortcut?: string
  action: () => void
}

const open = ref(false)

export const useCommandPalette = () => {
  const commands = ref<PaletteCommand[]>([])

  const register = (cmds: PaletteCommand[]) => {
    commands.value.push(...cmds)
  }

  const unregister = (ids: string[]) => {
    commands.value = commands.value.filter(c => !ids.includes(c.id))
  }

  const show = () => { open.value = true }
  const hide = () => { open.value = false }
  const toggle = () => { open.value = !open.value }

  return { open, commands, register, unregister, show, hide, toggle }
}
