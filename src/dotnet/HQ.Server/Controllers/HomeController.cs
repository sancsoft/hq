using Microsoft.AspNetCore.Mvc;

namespace HQ.Server.Controllers
{
    [ApiController]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class HomeController : ControllerBase
    {
        [HttpGet]
        [Route("/")]
        public IActionResult Index()
        {
            return Ok($"HQ {VersionNumber.GetVersionNumber()}");
        }
    }
}
