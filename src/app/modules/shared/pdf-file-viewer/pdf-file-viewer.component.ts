import { OteosSpinnerService, OteosTranslateService, OteosToastService } from 'oteos-components-lib';
import { Component, OnInit } from '@angular/core';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import { PdfFileViewer } from './pdf-file-viewer';
import { Location } from '@angular/common';

const ZOOM_STEP: number = 0.10; // 0.25 default
const DEFAULT_ZOOM: number = 0.5;

@Component({
  selector: 'pdf-file-viewer',
  templateUrl: './pdf-file-viewer.component.html',
  styleUrls: ['./pdf-file-viewer.component.scss']
})
export class PdfFileViewerComponent implements OnInit {
  /*
    To call pdf-file-viewer component:
      const pdfFileViewer: PdfFileViewer = {
        pdfSrc: 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf',
        isBase64: false,
        fileName: '',
        startPage: 1,
        showTotalPages: true,
        downloadable: true,
      }
      this.router.navigate(['/pdf-file-viewer'], { state: { pdfFileViewer: pdfFileViewer } });

    To recive state in pdf-file-viewer component, requeriment private readonly locationService: Location:
      const state: any = this.locationService.getState();
      if (!state || (state && !state.pdfFileViewer)) {
        this.spinner.hideSpinner();
        this.onClickComeBackBtn();
        return;
      }
  */

  public pdfFileViewer: PdfFileViewer; // Input parameter by route state

  public pdfSrc: string | Uint8Array;
	public pdfZoom: number = DEFAULT_ZOOM;
	public totalPages: number;

  constructor(
    private readonly locationService: Location,
    private readonly spinner: OteosSpinnerService,
    public readonly translateService: OteosTranslateService,
    private readonly toastService: OteosToastService,
  ) {
    this.pdfFileViewer = new PdfFileViewer();
  }

  /* Component Functions */
  async ngOnInit() {
    this.spinner.showSpinner();

    const state: any = this.locationService.getState();
    if (!state || (state && !state.pdfFileViewer)) {
      this.spinner.hideSpinner();
      this.onClickComeBackBtn();
      return;
    }

    this.pdfFileViewer = state.pdfFileViewer;

    if (!this.pdfFileViewer.pdfSrc) {
      this.spinner.hideSpinner();
      this.toastService.addErrorMessage(
        this.translateService.getTranslate('label.error.title'),
        this.translateService.getTranslate('label.file-viewer.not.pdfSrc.reported')
      );
      this.onClickComeBackBtn();
      return;
    }

    if (this.pdfFileViewer.fileName == undefined) {
      this.pdfFileViewer.fileName = 'pdf_file_viewer.pdf';
    }

    if (this.pdfFileViewer.startPage == undefined) {
      this.pdfFileViewer.startPage = 1;
    }
    
    if (this.pdfFileViewer.showTotalPages == undefined) {
      this.pdfFileViewer.showTotalPages = true;
    }

    if (this.pdfFileViewer.downloadable == undefined) {
      this.pdfFileViewer.downloadable = true;
    }

    if (this.pdfFileViewer.isBase64 == undefined) {
      this.pdfFileViewer.isBase64 = false;
    }

    // Conver Input url (Public internet pdf url or local pdf url) to base64 code
    if (this.pdfFileViewer.isBase64 == false) {
      let file = await fetch(this.pdfFileViewer.pdfSrc)
      .then(r => r.blob())
      .then(blobFile => new File([blobFile], this.pdfFileViewer.fileName, { type: "application/pdf" }));

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
          this.pdfFileViewer.pdfSrc = reader.result.toString().split("base64,")[1];
          this.pdfFileViewer.isBase64 = true;
          this.printPdf();
          return;
      };
    }

    await this.printPdf();
  }

  /* PdfViewer Component Functions */
  public zoomIn()
	{
		this.pdfZoom += ZOOM_STEP;
	}

	public zoomOut()
	{
		if (this.pdfZoom > (DEFAULT_ZOOM/2)) {
			this.pdfZoom -= ZOOM_STEP;
		}
	}

	public resetZoom()
	{
		this.pdfZoom = DEFAULT_ZOOM;
	}

	async callBackFn(pdf: PDFDocumentProxy) {
		this.totalPages = pdf.numPages;
    this.spinner.hideSpinner();
	}

  /* Comeback Function */
  public onClickComeBackBtn() {
    this.locationService.back();
  }

  /* PDF Functions */
  async printPdf() {
    const byteArray = new Uint8Array(
      atob(this.pdfFileViewer.pdfSrc)
        .split("")
        .map(char => char.charCodeAt(0))
    );

    const file = new Blob([byteArray], { type: "application/pdf" });
    const fileURL = URL.createObjectURL(file);

    this.pdfSrc = fileURL;
  }

  async onClickDownloadBtn() {
    try {
      const byteArray = new Uint8Array(
        atob(this.pdfFileViewer.pdfSrc)
          .split("")
          .map(char => char.charCodeAt(0))
      );
      
      const file = new Blob([byteArray], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      const pdfName = `${this.pdfFileViewer.fileName}`;
  
      // Construct the 'a' element
      let link = document.createElement("a");
      link.download = pdfName;
      link.target = "_blank";
  
      // Construct the URI
      link.href = fileURL;
      document.body.appendChild(link);
      link.click();
  
      // Cleanup the DOM
      document.body.removeChild(link);

      // Report result to user
      this.toastService.addSuccessMessage(
        this.translateService.getTranslate('label.success.title'),
        this.translateService.getTranslate('label.file-viewer.download.file.success')
      );
    } catch (err) {
      this.toastService.addErrorMessage(
        this.translateService.getTranslate('label.error.title'),
        this.translateService.getTranslate('label.file-viewer.download.file.error')
      );
    }
  }
} 
