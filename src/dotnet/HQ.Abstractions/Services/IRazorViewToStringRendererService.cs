namespace HQ.Abstractions.Services;

public interface IRazorViewToStringRendererService
{
    Task<string> RenderViewToStringAsync<TModel>(string viewName, TModel model, CancellationToken ct = default);
}