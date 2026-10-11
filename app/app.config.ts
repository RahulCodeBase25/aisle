export default defineAppConfig({
  ui: {
    colors: { primary: 'moss', secondary: 'ember', neutral: 'stone' },
    button: { defaultVariants: { size: 'md' }, slots: { base: 'rounded-full font-semibold' } },
    // Errors sit in a reserved strip under each field, so showing or clearing
    // one never moves the rest of the form (and never moves a button mid-click)
    formField: { slots: { root: 'pb-6', error: 'absolute left-0 top-full mt-1 text-error', help: 'absolute left-0 top-full mt-1 text-muted' } },
  },
})
