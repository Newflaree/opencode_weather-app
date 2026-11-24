# Revisión Weather CLI

- [x]  **Colores:** definidos en `src/colors.ts` (cyan menú, amarillo temp, verde/rojo ok/error), con detección TTY y respeto a `NO_COLOR`.
- [ ] **AGENTS.md:** dice que `index.ts` es stub, pero la app ya funciona — hay que actualizarlo.
- [x] **Ciudades:** geocoding ahora trae 5 resultados y permite elegir la coincidencia (con región y país) o cancelar.
- [ ] **Tests:** no existen; conviene al menos probar storage y las APIs con mocks.
- [ ] **Binario:** compila bien; revisar que `./weather` guarde datos en `~/.config/weather-cli/`.
- [ ] **Escalabilidad:** ¿qué tan fácil será expandir con nuevas funcionalidades?
- [x] **Carga:** estado de carga animado en tareas asíncronas (spinner en `src/spinner.ts`, usado en `src/weather.ts`).
