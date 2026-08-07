using Microsoft.AspNetCore.Mvc;
using NotificationService.Models;
using NotificationService.Service;

[ApiController]
[Route("api/notifications")]
public class NotificationController : ControllerBase
{
    private readonly FcmService _fcm;

    public NotificationController(FcmService fcm)
    {
        _fcm = fcm;
    }

    [HttpPost("send")]
    public async Task<IActionResult> Send(NotificationRequest request)
    {
        ApiResponse response = await _fcm.SendNotificationAsync(request);

        if(response.Status == "Success")
            return Ok(response);

        return BadRequest(response);
    }
}