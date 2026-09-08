using System;
using System.Diagnostics;
using System.IO;
using System.Threading;

namespace StudyStack
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.Title = "StudyStack — IIT Roorkee";
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("========================================================");
            Console.WriteLine("                StudyStack — IIT Roorkee                ");
            Console.WriteLine("                Your Stack. Your Track.                 ");
            Console.WriteLine("========================================================");
            Console.ResetColor();

            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            Directory.SetCurrentDirectory(baseDir);

            Console.WriteLine("🚀 Launching backend server and SQLite database...");

            ProcessStartInfo psi = new ProcessStartInfo
            {
                FileName = "cmd.exe",
                Arguments = "/c npm run server",
                WorkingDirectory = baseDir,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = false
            };

            Process serverProcess = new Process { StartInfo = psi };

            serverProcess.OutputDataReceived += (sender, e) =>
            {
                if (!string.IsNullOrEmpty(e.Data))
                {
                    Console.WriteLine("[Server] " + e.Data);
                }
            };

            serverProcess.ErrorDataReceived += (sender, e) =>
            {
                if (!string.IsNullOrEmpty(e.Data))
                {
                    Console.WriteLine("[Server] " + e.Data);
                }
            };

            serverProcess.Start();
            serverProcess.BeginOutputReadLine();
            serverProcess.BeginErrorReadLine();

            // Wait 2 seconds and open browser
            Thread.Sleep(2500);

            string url = "http://localhost:5000";
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("\n✅ StudyStack is running! Opening " + url + " in your browser...\n");
            Console.ResetColor();

            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = url,
                    UseShellExecute = true
                });
            }
            catch
            {
                Console.WriteLine("Please open " + url + " in your web browser.");
            }

            Console.WriteLine("--------------------------------------------------------");
            Console.WriteLine("Leave this window open while using StudyStack.");
            Console.WriteLine("To stop the server, press Ctrl+C or close this window.");
            Console.WriteLine("--------------------------------------------------------\n");

            serverProcess.WaitForExit();
        }
    }
}
