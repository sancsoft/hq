using System;

namespace HQ.Library.Extensions
{
    /// <summary>
    /// A collection of extensions to the string class for implementation convenience
    /// </summary>
    public static class StringExtensions
    {
        /// <summary>
        /// Basic style Left$ command
        /// </summary>
        /// <param name="value">string value</param>
        /// <param name="maxLength">max number of characters</param>
        /// <returns></returns>
        public static string Left(this string value, int maxLength)
        {
            if (string.IsNullOrEmpty(value)) return value;
            maxLength = Math.Abs(maxLength);
            return (value.Length <= maxLength ? value : value.Substring(0, maxLength));
        }

        /// <summary>
        /// Limit a string length and mark with elipises if too long, normally for display
        /// </summary>
        /// <param name="value">target string value</param>
        /// <param name="maxLength">max displayed length</param>
        /// <returns></returns>
        public static string Summarize(this string value, int maxLength)
        {
            if (string.IsNullOrEmpty(value)) return value;
            maxLength = Math.Abs(maxLength);
            maxLength = (maxLength > 3) ? maxLength - 3 : 0;
            return (value.Length <= maxLength ? value : value.Substring(0, maxLength) + "...");
        }
    }
}
