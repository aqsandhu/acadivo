// lib/screens/auth/forgot_password_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../utils/validators.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});
  @override
  ConsumerState<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _controller = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() { _controller.dispose(); super.dispose(); }

  String? _validateIdentifier(String? value) {
    if (value == null || value.trim().isEmpty) return 'Please enter your email or phone number';
    final trimmed = value.trim();
    if (trimmed.contains('@')) return Validators.email(trimmed);
    return Validators.phone(trimmed);
  }

  Future<void> _submit() async {
    setState(() => _errorMessage = null);
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);
    try {
      await ref.read(authServiceProvider).forgotPassword(_controller.text.trim());
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Password reset link sent! Check email or SMS.'), backgroundColor: Colors.green, duration: Duration(seconds: 4)),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _errorMessage = e.toString());
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(_errorMessage ?? 'Error'), backgroundColor: Colors.red));
      }
    } finally { if (mounted) setState(() => _isLoading = false); }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Forgot Password'), elevation: 0),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    width: 80, height: 80,
                    decoration: BoxDecoration(color: theme.colorScheme.primaryContainer.withOpacity(0.3), shape: BoxShape.circle),
                    child: Icon(Icons.lock_reset_outlined, size: 40, color: theme.colorScheme.primary),
                  ),
                ),
                const SizedBox(height: 24),
                Text('Reset Your Password', style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold), textAlign: TextAlign.center),
                const SizedBox(height: 8),
                Text('Enter your email or phone number. We will send a reset link/OTP.',
                  style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant), textAlign: TextAlign.center),
                const SizedBox(height: 32),
                if (_errorMessage != null) ...[
                  Container(padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: theme.colorScheme.errorContainer.withOpacity(0.3), borderRadius: BorderRadius.circular(8)),
                    child: Row(children: [Icon(Icons.error_outline, color: theme.colorScheme.error), const SizedBox(width: 8),
                      Expanded(child: Text(_errorMessage!, style: TextStyle(color: theme.colorScheme.error))),]),
                  ),
                  const SizedBox(height: 16),
                ],
                TextFormField(
                  controller: _controller,
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.done,
                  onFieldSubmitted: (_) => _isLoading ? null : _submit(),
                  decoration: InputDecoration(labelText: 'Email or Phone Number', hintText: 'e.g., user@email.com or 0300-1234567',
                    prefixIcon: const Icon(Icons.person_outline), border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    helperText: 'Pakistani formats: +92XXXXXXXXXX, 03XX-XXXXXXX'),
                  validator: _validateIdentifier,
                ),
                const SizedBox(height: 24),
                SizedBox(height: 48,
                  child: FilledButton(onPressed: _isLoading ? null : _submit,
                    style: FilledButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                    child: _isLoading ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Send Reset Link', style: TextStyle(fontSize: 16)),
                  ),
                ),
                const SizedBox(height: 16),
                TextButton(onPressed: () => context.pop(), child: const Text('Back to Login')),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
