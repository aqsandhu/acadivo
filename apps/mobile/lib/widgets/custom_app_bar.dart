import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final List<Widget>? actions;
  final bool showBackButton;
  final VoidCallback? onBackPressed;
  final Widget? bottom;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final bool centerTitle;
  final bool isUrdu;

  const CustomAppBar({
    super.key,
    required this.title,
    this.actions,
    this.showBackButton = true,
    this.onBackPressed,
    this.bottom,
    this.backgroundColor,
    this.foregroundColor,
    this.centerTitle = true,
    this.isUrdu = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final effectiveBackgroundColor = backgroundColor ?? theme.colorScheme.surface;
    final effectiveForegroundColor = foregroundColor ?? theme.colorScheme.onSurface;

    return AppBar(
      automaticallyImplyLeading: showBackButton,
      leading: showBackButton && Navigator.canPop(context)
          ? IconButton(
              icon: Icon(
                isUrdu ? Icons.arrow_forward : Icons.arrow_back,
                color: effectiveForegroundColor,
              ),
              onPressed: onBackPressed ?? () => Navigator.of(context).pop(),
            )
          : null,
      title: Text(
        title,
        style: theme.textTheme.titleLarge?.copyWith(
          color: effectiveForegroundColor,
          fontWeight: FontWeight.w600,
        ),
      ),
      centerTitle: centerTitle,
      actions: actions,
      backgroundColor: effectiveBackgroundColor,
      foregroundColor: effectiveForegroundColor,
      elevation: 0,
      scrolledUnderElevation: 0,
      bottom: bottom != null
          ? PreferredSize(
              preferredSize: const Size.fromHeight(48),
              child: bottom!,
            )
          : null,
      systemOverlayStyle: SystemUiOverlayStyle(
        statusBarColor: effectiveBackgroundColor,
        statusBarIconBrightness: theme.brightness == Brightness.dark ? Brightness.light : Brightness.dark,
      ),
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(
        kToolbarHeight + (bottom != null ? 48 : 0),
      );
}
