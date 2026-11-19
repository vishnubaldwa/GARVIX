import 'package:material_ui/material_ui.dart';
import 'package:intl/intl.dart';

import '../theme/apple_theme.dart';

final NumberFormat _inrFormat = NumberFormat.currency(
  locale: 'en_IN',
  symbol: '₹',
  decimalDigits: 0,
);

String formatInr(double amount) => _inrFormat.format(amount);

String formatShortDate(DateTime date) =>
    DateFormat('dd MMM yyyy').format(date.toLocal());

String formatDateTime(DateTime date) =>
    DateFormat('dd MMM, hh:mm a').format(date.toLocal());

class AppleCard extends StatelessWidget {
  const AppleCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.onTap,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final container = Container(
      decoration: BoxDecoration(
        color: AppleColors.surface,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppleColors.border),
        boxShadow: const [
          BoxShadow(
            color: Color(0x08000000),
            blurRadius: 14,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(22),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(22),
          child: Padding(padding: padding, child: child),
        ),
      ),
    );
    return container;
  }
}

class AppleBadge extends StatelessWidget {
  const AppleBadge({
    super.key,
    required this.label,
    this.background = AppleColors.blueSoft,
    this.foreground = AppleColors.blue,
  });

  final String label;
  final Color background;
  final Color foreground;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3.5),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: foreground,
          fontSize: 10.5,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.2,
        ),
      ),
    );
  }
}
