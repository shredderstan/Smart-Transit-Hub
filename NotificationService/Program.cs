using NotificationService.Service;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddScoped<IFcmService, FcmService>();
// Every injection gets a brand-new instance
builder.Services.AddTransient<FcmService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
});
});

var app = builder.Build();

app.UseCors("AllowAll");

app.MapControllers();

app.Run();
