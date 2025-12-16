using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

Log.Information("Starting ContPAQ Win Bridge service...");

try
{
    var builder = WebApplication.CreateBuilder(args);

    // Configure Kestrel to bind only to localhost:5000
    // This ensures the service is only accessible from the local machine
    builder.WebHost.ConfigureKestrel(options =>
    {
        options.ListenLocalhost(5000); // HTTP only - localhost service
    });

    // Configure Serilog
    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .WriteTo.Console()
        .WriteTo.File(
            path: "logs/bridge-.log",
            rollingInterval: RollingInterval.Day,
            retainedFileCountLimit: 30));

    // Add services to the container
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
        {
            Title = "ContPAQ Win Bridge API",
            Version = "v1",
            Description = "Windows Bridge service for ContPAQi SDK integration"
        });
        options.EnableAnnotations();
    });

    var app = builder.Build();

    // Configure the HTTP request pipeline
    app.UseSerilogRequestLogging();

    // Enable Swagger in development (and for localhost-only service)
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "ContPAQ Win Bridge API v1");
        options.RoutePrefix = "swagger";
    });

    // No HTTPS redirection - localhost only service
    // No authorization - localhost only service

    app.MapControllers();

    Log.Information("ContPAQ Win Bridge service started successfully");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "ContPAQ Win Bridge service terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
