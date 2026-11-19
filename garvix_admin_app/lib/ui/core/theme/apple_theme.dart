import 'package:material_ui/material_ui.dart';

class AppleColors {
  AppleColors._();

  static const Color canvas = Color(0xFFF5F5F7);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceSecondary = Color(0xFFFBFBFD);
  static const Color inkPrimary = Color(0xFF1D1D1F);
  static const Color inkSecondary = Color(0xFF6E6E73);
  static const Color inkMuted = Color(0xFF86868B);
  static const Color blue = Color(0xFF0071E3);
  static const Color blueSoft = Color(0xFFEAF3FF);
  static const Color green = Color(0xFF15803D);
  static const Color greenSoft = Color(0xFFECFDF5);
  static const Color amber = Color(0xFFB45309);
  static const Color amberSoft = Color(0xFFFFFBEB);
  static const Color red = Color(0xFFBE123C);
  static const Color redSoft = Color(0xFFFFF1F2);
  static const Color border = Color(0x14000000);
}

ThemeData buildAppleTheme() {
  return ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    scaffoldBackgroundColor: AppleColors.canvas,
    colorScheme: const ColorScheme.light(
      primary: AppleColors.blue,
      onPrimary: Colors.white,
      secondary: AppleColors.inkPrimary,
      onSecondary: Colors.white,
      surface: AppleColors.surface,
      onSurface: AppleColors.inkPrimary,
      error: AppleColors.red,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xE8FFFFFF),
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      scrolledUnderElevation: 0.5,
      foregroundColor: AppleColors.inkPrimary,
      centerTitle: false,
      titleTextStyle: TextStyle(
        color: AppleColors.inkPrimary,
        fontSize: 18,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.3,
      ),
    ),
    cardTheme: CardThemeData(
      color: AppleColors.surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: const BorderSide(color: AppleColors.border),
      ),
      margin: EdgeInsets.zero,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppleColors.canvas,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
      hintStyle: const TextStyle(color: AppleColors.inkMuted, fontSize: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppleColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppleColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppleColors.blue, width: 1.5),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: AppleColors.blue,
        foregroundColor: Colors.white,
        shape: const StadiumBorder(),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppleColors.inkPrimary,
        side: const BorderSide(color: AppleColors.border),
        shape: const StadiumBorder(),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: Colors.white,
      surfaceTintColor: Colors.transparent,
      indicatorColor: AppleColors.blueSoft,
      elevation: 0,
      height: 68,
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        final selected = states.contains(WidgetState.selected);
        return TextStyle(
          fontSize: 11,
          fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
          color: selected ? AppleColors.blue : AppleColors.inkMuted,
        );
      }),
      iconTheme: WidgetStateProperty.resolveWith((states) {
        final selected = states.contains(WidgetState.selected);
        return IconThemeData(
          size: 22,
          color: selected ? AppleColors.blue : AppleColors.inkMuted,
        );
      }),
    ),
  );
}
