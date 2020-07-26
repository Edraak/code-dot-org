require 'cdo/graphics/certificate_image'
require 'cdo/graphics/edraak_certificate_image'

class EdraakCodeCertificateController < ApplicationController
  def edraak_render_certificate
    extname = params[:image_ext]
    encoded = params[:cert_file_name]
    begin
      data = JSON.parse(Base64.urlsafe_decode64(encoded))
    rescue ArgumentError, OpenSSL::Cipher::CipherError, JSON::ParserError
      bad_request
    end

    extnames = ['jpg', 'jpeg', 'png']
    if extnames.include?(extname)
      begin
        image = create_course_certificate_image(data['name'], data['course'], data['sponsor'], data['course_title'])
        image = edraak_create_course_certificate_image(
            data['name'], data['course'], data['sponsor'], data['course_title'], request.locale
        )
        image.format = extname

        raw_img_base64 = 'data:image/jpg;base64,' + Base64.encode64(image.to_blob)
        render 'edraak_code_certificate/edraak_certificate_image', locals: {raw_img: raw_img_base64}, formats: [:html]
      ensure
        image && image.destroy!
      end
    else
      render html: '<html><body><h1>Unsupported Extension!</h1></body></html>'.html_safe
    end
  end
end
