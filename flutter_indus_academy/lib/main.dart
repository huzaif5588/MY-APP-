import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: IndusAcademyApp()));
}

class IndusAcademyApp extends StatelessWidget {
  const IndusAcademyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Indus Academy Kalabagh',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0B192C),
          primary: const Color(0xFF0B192C),
          secondary: const Color(0xFFD4AF37),
          surface: Colors.white,
          background: const Color(0xFFF8FAFC),
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(),
      ),
      home: const SplashScreen(),
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const MainNavigationScreen()),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B192C),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFD4AF37), width: 3),
              ),
              child: const Icon(Icons.school, size: 64, color: Color(0xFFD4AF37)),
            ),
            const SizedBox(height: 24),
            const Text(
              'INDUS ACADEMY',
              style: TextStyle(
                color: Color(0xFFD4AF37),
                fontSize: 28,
                fontWeight: FontWeight.bold,
                letterSpacing: 2,
              ),
            ),
            const Text(
              'KALABAGH • PAKISTAN',
              style: TextStyle(
                color: Colors.white70,
                fontSize: 14,
                letterSpacing: 4,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'LEARN • GROW • SUCCEED',
              style: TextStyle(
                color: Colors.white54,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class MainNavigationScreen extends StatelessWidget {
  const MainNavigationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B192C),
        title: const Text('Indus Academy Kalabagh', style: TextStyle(color: Colors.white)),
        actions: [
          IconButton(
            icon: const Icon(Icons.language, color: Color(0xFFD4AF37)),
            onPressed: () {},
          ),
        ],
      ),
      body: const Center(
        child: Text('Indus Academy Mobile ERP Core Running Successfully'),
      ),
    );
  }
}
