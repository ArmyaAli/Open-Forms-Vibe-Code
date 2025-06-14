import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle2,
  Settings,
  Info
} from "lucide-react";
import { FormField, FormRow } from "@shared/schema";
import { 
  downloadFormAsJson, 
  readJsonFile, 
  deserializeForm, 
  validateFormCompatibility,
  FormSerializationOptions,
  FormImportOptions
} from "@/lib/form-serialization";
import { useToast } from "@/hooks/use-toast";

interface FormImportExportProps {
  currentForm: {
    title: string;
    description: string;
    fields: FormField[];
    rows: FormRow[];
    themeColor: string;
  };
  onImportForm: (formData: {
    title: string;
    description: string;
    fields: FormField[];
    rows: FormRow[];
    themeColor: string;
  }) => void;
}

export default function FormImportExport({ currentForm, onImportForm }: FormImportExportProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  const [exportOptions, setExportOptions] = useState<FormSerializationOptions>({
    includeMetadata: true,
    minifyJson: false,
  });
  
  const [importOptions, setImportOptions] = useState<FormImportOptions>({
    replaceIds: true,
    validateStructure: true,
    preserveTheme: false,
  });
  
  const [importPreview, setImportPreview] = useState<any>(null);
  const [importValidation, setImportValidation] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFileData, setSelectedFileData] = useState<any>(null);

  const handleExportForm = async () => {
    try {
      setIsProcessing(true);
      
      downloadFormAsJson(
        currentForm.title,
        currentForm.description,
        currentForm.fields,
        currentForm.rows,
        currentForm.themeColor,
        exportOptions
      );
      
      toast({
        title: "Form Exported",
        description: `${currentForm.title} has been downloaded as a JSON file.`,
      });
      
      setExportDialogOpen(false);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export form",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setImportPreview(null);
      setImportValidation(null);

      const jsonData = await readJsonFile(file);
      
      // Store the file data for later use
      setSelectedFileData(jsonData);
      
      const validation = validateFormCompatibility(jsonData);
      setImportValidation(validation);
      
      if (validation.canImport) {
        const previewData = deserializeForm(jsonData, { 
          ...importOptions, 
          replaceIds: false // Don't replace IDs for preview
        });
        setImportPreview(previewData);
      }
      
    } catch (error) {
      console.error('File select error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to read file",
        variant: "destructive",
      });
      setImportValidation({
        isValid: false,
        version: "unknown",
        issues: [error instanceof Error ? error.message : "Unknown error"],
        canImport: false,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportForm = async () => {
    if (!importPreview || !selectedFileData) {
      return;
    }

    try {
      setIsProcessing(true);
      
      const formData = deserializeForm(selectedFileData, importOptions);
      
      const finalFormData = {
        title: formData.title,
        description: formData.description || "",
        fields: formData.fields,
        rows: formData.rows,
        themeColor: importOptions.preserveTheme ? currentForm.themeColor : formData.themeColor,
      };
      
      onImportForm(finalFormData);
      
      toast({
        title: "Form Imported",
        description: `${formData.title} has been successfully imported.`,
      });
      
      setImportDialogOpen(false);
      setImportPreview(null);
      setImportValidation(null);
      setSelectedFileData(null);
      
    } catch (error) {
      console.error('Import form error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import form",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetImport = () => {
    setImportPreview(null);
    setImportValidation(null);
    setSelectedFileData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export JSON
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download size={20} />
              Export Form as JSON
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} />
                <span className="font-medium">{currentForm.title}</span>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {currentForm.fields.length} fields, {currentForm.rows.length} rows
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="include-metadata">Include Metadata</Label>
                <input
                  id="include-metadata"
                  type="checkbox"
                  checked={exportOptions.includeMetadata}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    includeMetadata: e.target.checked
                  }))}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="minify-json">Minify JSON</Label>
                <input
                  id="minify-json"
                  type="checkbox"
                  checked={exportOptions.minifyJson}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    minifyJson: e.target.checked
                  }))}
                  className="rounded"
                />
              </div>
            </div>

            <Separator />

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setExportDialogOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleExportForm}
                disabled={isProcessing}
              >
                {isProcessing ? "Exporting..." : "Download JSON"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Upload size={16} className="mr-2" />
            Import JSON
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload size={20} />
              Import Form from JSON
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {!importPreview && (
              <>
                <div>
                  <Label htmlFor="form-file">Select JSON File</Label>
                  <Input
                    id="form-file"
                    type="file"
                    accept=".json,application/json"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="mt-1"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="replace-ids">Generate New IDs</Label>
                    <input
                      id="replace-ids"
                      type="checkbox"
                      checked={importOptions.replaceIds}
                      onChange={(e) => setImportOptions(prev => ({
                        ...prev,
                        replaceIds: e.target.checked
                      }))}
                      className="rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="preserve-theme">Keep Current Theme</Label>
                    <input
                      id="preserve-theme"
                      type="checkbox"
                      checked={importOptions.preserveTheme}
                      onChange={(e) => setImportOptions(prev => ({
                        ...prev,
                        preserveTheme: e.target.checked
                      }))}
                      className="rounded"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Validation Results */}
            {importValidation && (
              <Alert className={importValidation.isValid ? "border-green-200 bg-green-50 dark:bg-green-900/20" : "border-red-200 bg-red-50 dark:bg-red-900/20"}>
                <div className="flex items-center gap-2">
                  {importValidation.isValid ? (
                    <CheckCircle2 size={16} className="text-green-600" />
                  ) : (
                    <AlertCircle size={16} className="text-red-600" />
                  )}
                  <span className="font-medium">
                    {importValidation.isValid ? "Valid Form File" : "Invalid Form File"}
                  </span>
                </div>
                {importValidation.issues.length > 0 && (
                  <AlertDescription className="mt-2">
                    <ul className="list-disc list-inside space-y-1">
                      {importValidation.issues.map((issue, index) => (
                        <li key={index} className="text-sm">{issue}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                )}
              </Alert>
            )}

            {/* Import Preview */}
            {importPreview && importValidation?.canImport && (
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Info size={16} />
                  <span className="font-medium">Import Preview</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div><strong>Title:</strong> {importPreview.title}</div>
                  {importPreview.description && (
                    <div><strong>Description:</strong> {importPreview.description}</div>
                  )}
                  <div><strong>Fields:</strong> {importPreview.fields.length}</div>
                  <div><strong>Rows:</strong> {importPreview.rows.length}</div>
                  <div className="flex items-center gap-2">
                    <strong>Theme:</strong>
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: importPreview.themeColor }}
                    />
                    <span>{importPreview.themeColor}</span>
                  </div>
                </div>

                {importValidation.version && (
                  <Badge variant="secondary" className="text-xs">
                    Version {importValidation.version}
                  </Badge>
                )}
              </div>
            )}

            <Separator />

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setImportDialogOpen(false);
                  resetImport();
                }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              
              {importPreview && (
                <Button 
                  variant="outline"
                  onClick={resetImport}
                  disabled={isProcessing}
                >
                  Choose Different File
                </Button>
              )}
              
              {importValidation?.canImport && (
                <Button 
                  onClick={handleImportForm}
                  disabled={isProcessing || !importPreview}
                >
                  {isProcessing ? "Importing..." : "Import Form"}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}