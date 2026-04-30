// lib/screens/auth/reset_password_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../utils/validators.dart';

class ResetPasswordScreen extends ConsumerStatefulWidget {
  final String? token;
  const ResetPasswordScreen({super.key, this.token});
  @override
  ConsumerState<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends ConsumerState<ResetPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _tokenController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _obscureConfirm = true;
  String? _errorMessage;
  double _passwordStrength = 0.0;

  @override
  void initState() {
    super.initState();
    if (widget.token != null) _tokenController.text = widget.token!;
  }

  @override
  void dispose() {
    _tokenController.dispose(); _passwordController.dispose(); _confirmController.dispose();
    super.dispose();
  }

  double _calculateStrength(String password) {
    if (password.isEmpty) return 0.0;
    double s = 0.0;
    if (password.length >= 8) s += 0.25;
    if (password.length >= 12) s += 0.15;
    if (password.contains(RegExp(r'[A-Z]'))) s += 0.15;
    if (password.contains(RegExp(r'[a-z]'))) s += 0.15;
    if (password.contains(RegExp(r'[0-9]'))) s += 0.15;
    if (password.contains(RegExp(r'[!@#\$%^&*(),.?":{}|<>]'))) s += 0.15;
    return s.clamp(0.0, 1.0);
  }

  (String, Color) _getStrengthLabel(double strength) {
    if (strength < 0.3) return ('Weak', Colors.red);
    if (strength < 0.6) return ('Fair', Colors.orange);
    if (strength < 0.8) return ('Good', Colors.blue);
    return ('Strong', Colors.green);
  }

  Future<void> _submit() async {
    setState(() => _errorMessage = null);
    if (!_formKey.currentState!.validate()) return;
    if (_passwordController.text != _confirmController.text) { setState(() => _errorMessage = 'Passwords do not match'); return; }
    if (_tokenController.text.trim().isEmpty) { setState(() => _errorMessage = 'OTP/Token is required'); return; }
    setState(() => _isLoading = true);
    try {
      await ref.read(authServiceProvider).resetPassword(token: _tokenController.text.trim(), newPassword: _passwordController.text);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Password reset! You can now log in.'), backgroundColor: Colors.green, duration: Duration(seconds: 4)));
        context.go('/login');
      }
    } catch (e) {
      if (mounted) { setState(() => _errorMessage = e.toString());
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(_errorMessage ?? 'Failed'), backgroundColor: Colors.red)); }
    } finally { if (mounted) setState(() => _isLoading = false); }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final (strengthLabel, strengthColor) = _getStrengthLabel(_passwordStrength);
    return Scaffold(
      appBar: AppBar(title: const Text('Reset Password'), elevation: 0),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(child: Container(width: 80, height: 80,
                  decoration: BoxDecoration(color: theme.colorScheme.primaryContainer.withOpacity(0.3), shape: BoxShape.circle),
                  child: Icon(Icons.lock_outline, size: 40, color: theme.colorScheme.primary),),),
                const SizedBox(height: 24),
                Text('Create New Password', style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold), textAlign: TextAlign.center),
                const SizedBox(height: 8),
                Text('Enter the OTP and create a strong new password.', style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant), textAlign: TextAlign.center),
                const SizedBox(height: 32),
                if (_errorMessage != null) ...[
                  Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: theme.colorScheme.errorContainer.withOpacity(0.3), borderRadius: BorderRadius.circular(8)),
                    child: Row(children: [Icon(Icons.error_outline, color: theme.colorScheme.error), const SizedBox(width: 8), Expanded(child: Text(_errorMessage!, style: TextStyle(color: theme.colorScheme.error))),]),),
                  const SizedBox(height: 16),
                ],
                TextFormField(controller: _tokenController, keyboardType: TextInputType.text, textInputAction: TextInputAction.next,
                  decoration: InputDecoration(labelText: 'OTP / Reset Token', hintText: 'Enter OTP', prefixIcon: const Icon(Icons.confirmation_number_outlined), border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
                  validator: (v) { if (v == null || v.trim().isEmpty) return 'OTP required'; if (v.trim().length < 4) return 'Invalid OTP'; return null; },
                ),
                const SizedBox(height: 20),
                TextFormField(controller: _passwordController, obscureText: _obscurePassword, textInputAction: TextInputAction.next,
                  onChanged: (v) => setState(() => _passwordStrength = _calculateStrength(v)),
                  decoration: InputDecoration(labelText: 'New Password', hintText: 'Strong password', prefixIcon: const Icon(Icons.lock_outline),
                    suffixIcon: IconButton(icon: Icon(_obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined), onPressed: () => setState(() => _obscurePassword = !_obscurePassword)),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
                  validator: Validators.password,
                ),
                const SizedBox(height: 8),
                if (_passwordController.text.isNotEmpty) ...[
                  Row(children: [Expanded(flex: (_passwordStrength * 100).toInt(), child: Container(height: 4, decoration: BoxDecoration(color: strengthColor, borderRadius: BorderRadius.circular(2)))),
                    Expanded(flex: 100 - (_passwordStrength * 100).toInt(), child: Container(height: 4, color: theme.colorScheme.surfaceContainerHighest)),],),
                  const SizedBox(height: 4),
                  Text('Strength: $strengthLabel', style: theme.textTheme.bodySmall?.copyWith(color: strengthColor, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                ],
                TextFormField(controller: _confirmController, obscureText: _obscureConfirm, textInputAction: TextInputAction.done,
                  onFieldSubmitted: (_) => _isLoading ? null : _submit(),
                  decoration: InputDecoration(labelText: 'Confirm Password', hintText: 'Re-enter password', prefixIcon: const Icon(Icons.lock_outline),
                    suffixIcon: IconButton(icon: Icon(_obscureConfirm ? Icons.visibility_outlined : Icons.visibility_off_outlined), onPressed: () => setState(() => _obscureConfirm = !_obscureConfirm)),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
                  validator: (v) => Validators.confirmPassword(v, _passwordController.text),
                ),
                const SizedBox(height: 8),
                Text('Min 8 chars with uppercase, lowercase, and number.', style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
                const SizedBox(height: 32),
                SizedBox(height: 48,
                  child: FilledButton(onPressed: _isLoading ? null : _submit,
                    style: FilledButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                    child: _isLoading ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Reset Password', style: TextStyle(fontSize: 16)),
                  ),
                ),
                const SizedBox(height: 16),
                TextButton(onPressed: () => context.go('/login'), child: const Text('Back to Login')),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
