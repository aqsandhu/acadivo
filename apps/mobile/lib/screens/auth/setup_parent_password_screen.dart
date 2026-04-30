import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/auth_provider.dart';

class SetupParentPasswordScreen extends ConsumerStatefulWidget {
  const SetupParentPasswordScreen({super.key});

  @override
  ConsumerState<SetupParentPasswordScreen> createState() => _SetupParentPasswordScreenState();
}

class _SetupParentPasswordScreenState extends ConsumerState<SetupParentPasswordScreen> {
  final _studentIdController = TextEditingController();
  final _otpController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _studentIdController.dispose();
    _otpController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _isLoading = true);

    final authService = ref.read(authServiceProvider);
    try {
      await authService.setupParentPassword(
        studentId: _studentIdController.text.trim(),
        otp: _otpController.text.trim(),
        password: _passwordController.text,
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Password set successfully!')),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Setup Parent Password')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'You and your child share the same student ID. Set your parent password below to access your parent account.',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _studentIdController,
              decoration: const InputDecoration(
                labelText: 'Student ID',
                hintText: 'Enter student ID',
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _otpController,
              decoration: const InputDecoration(
                labelText: 'OTP',
                hintText: 'Enter OTP code',
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _passwordController,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'New Password',
                hintText: 'Set your password',
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              height: 48,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _submit,
                child: _isLoading
                    ? const CircularProgressIndicator(strokeWidth: 2)
                    : const Text('Set Password'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
