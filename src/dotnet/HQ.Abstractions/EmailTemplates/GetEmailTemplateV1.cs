using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HQ.Abstractions.Common;
using HQ.Abstractions.Emails;
using HQ.Abstractions.Enumerations;

namespace HQ.Abstractions.EmailTemplates;

public class GetEmailTemplateV1
{
    public class Request<T> where T : BaseEmail
    {
        public EmailMessage EmailMessage { get; set; }
        public T Model { get; set; } = null!;
    }

    public class Response
    {
        public string MJML { get; set; } = null!;
        public string HTML { get; set; } = null!;
        public string Text { get; set; } = null!;
    }
}