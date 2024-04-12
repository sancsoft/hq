using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.Abstractions.Common;

public abstract class PagedRequestV1
{
    public int? Skip { get; set; }
    public int? Take { get; set; }
}
