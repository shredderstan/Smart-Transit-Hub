using NotificationService.Models;

namespace NotificationService.Service
{
    public interface IFcmService
    {
        Task<ApiResponse> SendNotificationAsync(NotificationRequest request);
    }
}
