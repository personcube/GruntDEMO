using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Grunt_DEMO.Startup))]
namespace Grunt_DEMO
{
    public partial class Startup {
        public void Configuration(IAppBuilder app) {
            ConfigureAuth(app);
        }
    }
}
