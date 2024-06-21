using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.Abstractions.Common;

public abstract class PagedResponseV1<T>
{
    public IReadOnlyCollection<T> Records { get; set; } = new List<T>();
    public long? Total { get; set; }
}