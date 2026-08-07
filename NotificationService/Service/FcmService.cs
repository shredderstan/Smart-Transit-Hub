using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using NotificationService.Models;
using System.Net;

namespace NotificationService.Service
{
    public class FcmService : IFcmService
    {

        public FcmService(IConfiguration configuration)
        {
            if (FirebaseApp.DefaultInstance == null)
            {
                string? path = configuration["Firebase:ServiceAccountPath"];

                if (string.IsNullOrWhiteSpace(path))
                    throw new InvalidOperationException(
                        "Firebase service account path is not configured.");

                if (!File.Exists(path))
                    throw new FileNotFoundException(
                        $"Firebase service account file not found: {path}");

                using var stream = File.OpenRead(path);

                var serviceAccount =
                    ServiceAccountCredential.FromServiceAccountData(stream);

                FirebaseApp.Create(new AppOptions
                {
                    Credential =
                        GoogleCredential.FromServiceAccountCredential(
                            serviceAccount)
                });
            }
        }

        public async Task<ApiResponse> SendNotificationAsync(NotificationRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Token))
            {
                return new ApiResponse
                {
                    Status = "Failure",
                    Message = "Invalid Device Token"
                };
            }

            var message = new Message
            {
                Token = request.Token,

                Notification = new Notification
                {
                    Title = request.Title,
                    Body = request.Body
                }
            };

            try
            {
                string response = await FirebaseMessaging.DefaultInstance.SendAsync(message);

                return new ApiResponse
                {
                    Status = "Success",
                    Message = response
                };
            }
            catch(Exception ex)
            {
                return new ApiResponse
                {
                    Status = "Failure",
                    Message = ex.Message
                };
            }
        }
    }
}
