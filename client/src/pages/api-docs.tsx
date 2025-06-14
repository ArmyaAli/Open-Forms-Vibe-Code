import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Copy, Code, Book, Zap, Settings, Database, Search, Users, Webhook, FileText, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ApiDocs() {
  const { toast } = useToast();
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(`${window.location.protocol}//${window.location.host}`);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Code snippet copied successfully",
    });
  };

  const apiCategories = [
    {
      name: "Forms",
      icon: <FileText className="h-4 w-4" />,
      description: "Core form management operations",
      endpoints: ["GET /api/forms", "POST /api/forms", "PUT /api/forms/{id}", "DELETE /api/forms/{id}"]
    },
    {
      name: "Fields & Rows",
      icon: <Settings className="h-4 w-4" />,
      description: "Manage form structure and layout",
      endpoints: ["POST /api/forms/{id}/fields", "PUT /api/forms/{id}/fields/{fieldId}", "DELETE /api/forms/{id}/fields/{fieldId}"]
    },
    {
      name: "Responses",
      icon: <Database className="h-4 w-4" />,
      description: "Collect and manage form submissions",
      endpoints: ["POST /api/forms/{id}/responses", "GET /api/forms/{id}/responses", "GET /api/responses/stats"]
    },
    {
      name: "Analytics",
      icon: <Zap className="h-4 w-4" />,
      description: "Form performance and insights",
      endpoints: ["GET /api/forms/{id}/analytics", "GET /api/user/stats"]
    },
    {
      name: "Export & Import",
      icon: <Share className="h-4 w-4" />,
      description: "Data exchange capabilities",
      endpoints: ["GET /api/forms/{id}/export", "POST /api/forms/import", "GET /api/responses/export/csv"]
    },
    {
      name: "Search & Filter",
      icon: <Search className="h-4 w-4" />,
      description: "Advanced search and filtering",
      endpoints: ["GET /api/forms/search", "GET /api/user/forms"]
    },
    {
      name: "User Management",
      icon: <Users className="h-4 w-4" />,
      description: "User-specific operations",
      endpoints: ["GET /api/user/forms", "GET /api/user/stats"]
    },
    {
      name: "Webhooks",
      icon: <Webhook className="h-4 w-4" />,
      description: "Real-time integrations",
      endpoints: ["POST /api/forms/{id}/webhook", "POST /api/forms/{id}/webhook/test"]
    }
  ];

  const codeExamples = {
    javascript: `// Create a new form
const response = await fetch('${baseUrl}/api/forms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    title: 'Contact Form',
    description: 'Get in touch with us',
    fields: [
      {
        type: 'text',
        label: 'Full Name',
        required: true
      },
      {
        type: 'email',
        label: 'Email Address',
        required: true
      }
    ],
    themeColor: '#3b82f6'
  })
});

const form = await response.json();
console.log('Form created:', form);`,

    python: `import requests

# Create a new form
url = '${baseUrl}/api/forms'
data = {
    'title': 'Contact Form',
    'description': 'Get in touch with us',
    'fields': [
        {
            'type': 'text',
            'label': 'Full Name',
            'required': True
        },
        {
            'type': 'email',
            'label': 'Email Address',
            'required': True
        }
    ],
    'themeColor': '#3b82f6'
}

response = requests.post(url, json=data)
form = response.json()
print('Form created:', form)`,

    curl: `# Create a new form
curl -X POST '${baseUrl}/api/forms' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "title": "Contact Form",
    "description": "Get in touch with us",
    "fields": [
      {
        "type": "text",
        "label": "Full Name",
        "required": true
      },
      {
        "type": "email",
        "label": "Email Address",
        "required": true
      }
    ],
    "themeColor": "#3b82f6"
  }'`
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          OpenForms API Documentation
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Comprehensive REST API for form building, management, and response collection. 
          Build custom integrations and automate your form workflows.
        </p>
        <div className="flex justify-center gap-4">
          <Button 
            onClick={() => window.open('/api/docs', '_blank')} 
            className="flex items-center gap-2"
          >
            <Book className="h-4 w-4" />
            Interactive Documentation
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Badge variant="secondary" className="px-4 py-2">
            API Version 1.0.0
          </Badge>
        </div>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Start
          </CardTitle>
          <CardDescription>
            Get started with the OpenForms API in minutes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">1. Authentication</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Use session-based authentication. Login via the web interface or API.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">2. Create Forms</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Use POST /api/forms to create forms with fields, rows, and styling.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">3. Collect Responses</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Accept submissions via POST /api/forms/{id}/responses endpoint.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Categories */}
      <div>
        <h2 className="text-2xl font-bold mb-6">API Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {apiCategories.map((category) => (
            <Card key={category.name} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  {category.icon}
                  {category.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {category.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {category.endpoints.slice(0, 3).map((endpoint) => (
                    <div key={endpoint} className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {endpoint}
                    </div>
                  ))}
                  {category.endpoints.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{category.endpoints.length - 3} more
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Code Examples
          </CardTitle>
          <CardDescription>
            Example implementations in popular programming languages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="javascript" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
            </TabsList>
            
            {Object.entries(codeExamples).map(([lang, code]) => (
              <TabsContent key={lang} value={lang} className="mt-4">
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{code}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(code)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>
            Session-based authentication for secure API access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Session Authentication</h3>
            <p className="text-sm mb-3">
              The API uses session-based authentication. After logging in through the web interface, 
              your session cookie will be automatically included in API requests.
            </p>
            <div className="space-y-2">
              <div className="font-mono text-sm bg-white dark:bg-gray-800 p-2 rounded">
                POST /api/auth/login
              </div>
              <div className="font-mono text-sm bg-white dark:bg-gray-800 p-2 rounded">
                POST /api/auth/logout
              </div>
              <div className="font-mono text-sm bg-white dark:bg-gray-800 p-2 rounded">
                GET /api/auth/user
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limits & Best Practices</CardTitle>
          <CardDescription>
            Guidelines for responsible API usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Rate Limits</h3>
              <ul className="space-y-2 text-sm">
                <li>• 1000 requests/hour for authenticated users</li>
                <li>• 100 requests/hour for anonymous users</li>
                <li>• Burst limit: 10 requests/second</li>
                <li>• Rate limit headers included in responses</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Best Practices</h3>
              <ul className="space-y-2 text-sm">
                <li>• Use pagination for large datasets</li>
                <li>• Implement proper error handling</li>
                <li>• Cache responses when appropriate</li>
                <li>• Use webhooks for real-time updates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Resources and support for API developers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => window.open('/api/docs', '_blank')}
            >
              <Book className="h-6 w-6" />
              <span>Interactive Docs</span>
              <span className="text-xs text-gray-500">Try API endpoints</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => copyToClipboard(JSON.stringify({
                title: "Support Request",
                description: "API documentation and examples",
                baseUrl: baseUrl
              }, null, 2))}
            >
              <Code className="h-6 w-6" />
              <span>Code Examples</span>
              <span className="text-xs text-gray-500">Copy snippets</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => window.open('mailto:support@openforms.ca', '_blank')}
            >
              <Users className="h-6 w-6" />
              <span>Contact Support</span>
              <span className="text-xs text-gray-500">Get help</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}